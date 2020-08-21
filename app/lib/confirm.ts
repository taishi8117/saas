import { openConfirmDialogExternal } from '../components/common/Confirmer';

export default function confirm({
  title,
  message,
  onAnswer,
}: {
  title: string;
  message: string;
  onAnswer: (answer: boolean) => void;
}) {
  openConfirmDialogExternal({ title, message, onAnswer });
}
