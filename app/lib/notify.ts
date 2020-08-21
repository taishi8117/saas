import { openSnackbarExternal } from '../components/common/Notifier';

export default function notify(obj: any) {
  openSnackbarExternal({ message: obj.message || obj.toString() });
}
