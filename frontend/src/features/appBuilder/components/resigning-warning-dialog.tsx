import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import { useSourceSelector } from "../contexts/source-selector.context";

interface ResigningWarningDialogProps {
  reason?: string;
}

export default function ResigningWarningDialog(
  props: ResigningWarningDialogProps,
) {
  const [context, actions] = useSourceSelector();
  return (
    <AlertDialog open={context.showResigningWarningDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>APK will be re-signed!</AlertDialogTitle>
          <AlertDialogDescription>
            {props.reason}
            This APK will be re-signed with a different key. To install it,
            either uninstall the original app from your device or change the
            package name so it can be installed alongside the original.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={actions.rejectResigning}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={actions.acceptResigning}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
