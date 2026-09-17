import componentCss from './AlertDialog.css?inline'
import { AlertDialog as AlertDialogBase } from './AlertDialog'
import { mayStyled } from '../../styles/runtime'

export const AlertDialog = /*#__PURE__*/ mayStyled('AlertDialog', AlertDialogBase, componentCss)
export type { AlertDialogProps } from './AlertDialog'
