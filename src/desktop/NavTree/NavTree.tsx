import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { IoChevronForward } from 'react-icons/io5'
import { cx } from '../../utils/cx'
import { usePressFeedback } from '../../hooks/usePressFeedback'
import { useAutoId } from '../../utils/useId'

export interface NavTreeNode {
  /** Stable across renders — selection, expansion and focus are all keyed on it. */
  id: string
  label: ReactNode
  icon?: ReactNode
  /** A count or status pill, shown at the trailing edge. */
  badge?: ReactNode
  children?: NavTreeNode[]
  disabled?: boolean
}

export interface NavTreeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  nodes: NavTreeNode[]
  /** Controlled selection. */
  selectedId?: string
  defaultSelectedId?: string
  onSelect?: (id: string, node: NavTreeNode) => void
  /** Controlled expansion. */
  expandedIds?: string[]
  defaultExpandedIds?: string[]
  onExpandedChange?: (ids: string[]) => void
  'aria-label'?: string
}

interface FlatNode {
  node: NavTreeNode
  level: number
  parentId: string | null
}

/**
 * Depth-first walk of everything currently on screen. Keyboard navigation is
 * defined against the *visible* order — arrow-down from a collapsed folder must
 * skip its children, not walk into them — so this flat list, not the nested
 * data, is the model the key handler works from.
 */
function flattenVisible(
  nodes: NavTreeNode[],
  expanded: ReadonlySet<string>,
  level = 0,
  parentId: string | null = null,
  out: FlatNode[] = [],
): FlatNode[] {
  for (const node of nodes) {
    out.push({ node, level, parentId })
    if (node.children?.length && expanded.has(node.id)) {
      flattenVisible(node.children, expanded, level + 1, node.id, out)
    }
  }
  return out
}

const hasChildren = (node: NavTreeNode) => Boolean(node.children?.length)

/**
 * Everything a row needs from the tree. Passed by context rather than props
 * because rows recurse: threading eight callbacks through every level would
 * make the recursion the widest part of the component.
 */
interface TreeApi {
  baseId: string
  selectedId: string | undefined
  expanded: ReadonlySet<string>
  /** The single row in the tab order — see the roving-tabindex note on NavTree. */
  tabbableId: string | undefined
  setExpanded: (id: string, open: boolean) => void
  select: (node: NavTreeNode) => void
  onRowFocus: (id: string) => void
  registerRow: (id: string, element: HTMLButtonElement | null) => void
}

const TreeContext = createContext<TreeApi | null>(null)

/**
 * A multi-level navigation tree.
 *
 * Branches animate their height on a grid track, indent guides are hairlines
 * drawn as pseudo-elements rather than borders, and the selected node carries a
 * tinted fill.
 *
 * Focus is roving: exactly one row is tabbable, so the whole tree is a single
 * tab stop and the arrow keys move inside it. That is the part a tree built out
 * of plain buttons gets wrong — twenty folders become twenty tab stops, and
 * reaching the content past them costs twenty presses.
 */
export function NavTree({
  nodes,
  selectedId,
  defaultSelectedId,
  onSelect,
  expandedIds,
  defaultExpandedIds,
  onExpandedChange,
  className,
  id,
  ...rest
}: NavTreeProps) {
  const autoId = useAutoId(id)
  const [internalSelected, setInternalSelected] = useState(defaultSelectedId)
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpandedIds ?? [])
  const [focusId, setFocusId] = useState<string | undefined>(defaultSelectedId ?? selectedId)
  const rows = useRef(new Map<string, HTMLButtonElement>())

  const selected = selectedId ?? internalSelected
  const expanded = useMemo(
    () => new Set(expandedIds ?? internalExpanded),
    [expandedIds, internalExpanded],
  )
  const visible = useMemo(() => flattenVisible(nodes, expanded), [nodes, expanded])

  /* Collapsing a branch can strand focus on a row that is no longer on screen;
   * falling back to the first row keeps the tree reachable by Tab. */
  const tabbableId =
    visible.find((entry) => entry.node.id === focusId)?.node.id ?? visible[0]?.node.id

  const setExpanded = useCallback(
    (nodeId: string, open: boolean) => {
      const next = new Set(expandedIds ?? internalExpanded)
      if (open) next.add(nodeId)
      else next.delete(nodeId)
      const list = [...next]
      if (expandedIds === undefined) setInternalExpanded(list)
      onExpandedChange?.(list)
    },
    [expandedIds, internalExpanded, onExpandedChange],
  )

  const select = useCallback(
    (node: NavTreeNode) => {
      if (selectedId === undefined) setInternalSelected(node.id)
      onSelect?.(node.id, node)
    },
    [selectedId, onSelect],
  )

  const registerRow = useCallback((nodeId: string, element: HTMLButtonElement | null) => {
    if (element) rows.current.set(nodeId, element)
    else rows.current.delete(nodeId)
  }, [])

  const focusNode = useCallback((nodeId: string | undefined) => {
    if (!nodeId) return
    setFocusId(nodeId)
    rows.current.get(nodeId)?.focus()
  }, [])

  const api = useMemo<TreeApi>(
    () => ({
      baseId: autoId,
      selectedId: selected,
      expanded,
      tabbableId,
      setExpanded,
      select,
      onRowFocus: setFocusId,
      registerRow,
    }),
    [autoId, selected, expanded, tabbableId, setExpanded, select, registerRow],
  )

  /**
   * One listener on the tree rather than one per row: the visible-order model
   * the keys need already lives here, and rows stay cheap.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = visible.findIndex((entry) => entry.node.id === tabbableId)
    if (index === -1) return
    const entry = visible[index]!
    const node = entry.node
    const open = expanded.has(node.id)

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusNode(visible[index + 1]?.node.id)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusNode(visible[index - 1]?.node.id)
        break
      case 'ArrowRight':
        event.preventDefault()
        // First press opens the branch, the second walks into it: the two-step
        // that lets you look inside a folder without leaving where you are.
        if (hasChildren(node) && !open) setExpanded(node.id, true)
        else if (hasChildren(node)) focusNode(visible[index + 1]?.node.id)
        break
      case 'ArrowLeft':
        event.preventDefault()
        if (hasChildren(node) && open) setExpanded(node.id, false)
        else focusNode(entry.parentId ?? undefined)
        break
      case 'Home':
        event.preventDefault()
        focusNode(visible[0]?.node.id)
        break
      case 'End':
        event.preventDefault()
        focusNode(visible[visible.length - 1]?.node.id)
        break
      default:
        break
    }
  }

  return (
    <TreeContext.Provider value={api}>
      <div
        {...rest}
        id={autoId}
        role="tree"
        data-slot="nav-tree"
        className={cx('may-navtree', className)}
        onKeyDown={onKeyDown}
      >
        <Branch nodes={nodes} level={0} />
      </div>
    </TreeContext.Provider>
  )
}

/**
 * One level. `--may-navtree-level` is set here rather than on each row so the
 * indent guide and the rows it belongs to can never disagree about the depth
 * they are drawing.
 */
function Branch({ nodes, level }: { nodes: NavTreeNode[]; level: number }) {
  return (
    <div
      role="group"
      data-level={level}
      className="may-navtree__group"
      style={{ '--may-navtree-level': level } as CSSProperties}
    >
      {nodes.map((node) => (
        <Row key={node.id} node={node} level={level} />
      ))}
    </div>
  )
}

function Row({ node, level }: { node: NavTreeNode; level: number }) {
  const api = useContext(TreeContext)
  const { pressProps } = usePressFeedback(node.disabled)
  if (!api) throw new Error('NavTree rows must render inside <NavTree>')

  const branchy = hasChildren(node)
  const open = branchy && api.expanded.has(node.id)
  const selected = node.id === api.selectedId
  const groupId = `${api.baseId}-${node.id}-group`

  return (
    /* `role="none"` flattens this wrapper away, so the treeitem stays an owned
     * child of the tree rather than sitting behind an anonymous div. */
    <div className="may-navtree__node" data-state={open ? 'open' : 'closed'} role="none">
      <button
        {...pressProps}
        ref={(element) => api.registerRow(node.id, element)}
        type="button"
        role="treeitem"
        aria-level={level + 1}
        aria-selected={selected}
        aria-expanded={branchy ? open : undefined}
        /* The group is a DOM sibling so the row itself can stay a real
         * <button>; aria-owns re-parents it in the accessibility tree, which is
         * what keeps the treeitem → group relationship valid. */
        aria-owns={branchy ? groupId : undefined}
        tabIndex={node.id === api.tabbableId ? 0 : -1}
        disabled={node.disabled}
        data-slot="nav-tree-item"
        data-selected={selected ? 'true' : undefined}
        className="may-navtree__row may-hoverable"
        onFocus={() => api.onRowFocus(node.id)}
        onClick={() => {
          api.select(node)
          // A branch is both a destination and a container, so a click does
          // both jobs. The arrow keys are there for when you want only one.
          if (branchy) api.setExpanded(node.id, !open)
        }}
      >
        {/* Always rendered, even on a leaf: it is the column the labels align
         * to, and a leaf that borrows its width sits under its siblings. */}
        <span className="may-navtree__twisty" aria-hidden>
          {branchy && <IoChevronForward focusable="false" />}
        </span>
        {node.icon && (
          <span className="may-navtree__icon" aria-hidden>
            {node.icon}
          </span>
        )}
        <span className="may-navtree__label">{node.label}</span>
        {node.badge != null && <span className="may-navtree__badge">{node.badge}</span>}
      </button>

      {branchy && (
        <div id={groupId} className="may-navtree__panel">
          {/* The clipping child the grid track squeezes; the branch inside keeps
           * its own height, so nothing reflows mid-transition. */}
          <div className="may-navtree__clip">
            <Branch nodes={node.children!} level={level + 1} />
          </div>
        </div>
      )}
    </div>
  )
}
