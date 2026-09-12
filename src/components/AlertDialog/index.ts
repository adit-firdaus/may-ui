import componentCss from './AlertDialog.css?inline'
import { AlertDialog as AlertDialogBase } from './AlertDialog'
import { mayStyleSheet, withMayStyles } from '../../styles/runtime'

const componentStyle = mayStyleSheet('AlertDialog', componentCss)
const componentStyles = [componentStyle] as const

export const AlertDialog = withMayStyles('AlertDialog', AlertDialogBase, componentStyles)
export type { AlertDialogProps } from './AlertDialog'
