import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      closeButton
      visibleToasts={4}
      duration={3600}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" strokeWidth={2.75} />
        ),
        info: (
          <InfoIcon className="size-4" strokeWidth={2.75} />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" strokeWidth={2.75} />
        ),
        error: (
          <OctagonXIcon className="size-4" strokeWidth={2.75} />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "#d4e4ef",
          "--success-bg": "#f0fbf1",
          "--success-border": "rgba(42, 107, 44, 0.32)",
          "--success-text": "#205722",
          "--info-bg": "#E6F6FF",
          "--info-border": "rgba(0, 70, 139, 0.28)",
          "--info-text": "#00468B",
          "--warning-bg": "#fff8e5",
          "--warning-border": "rgba(160, 103, 0, 0.34)",
          "--warning-text": "#805200",
          "--error-bg": "#fff0f0",
          "--error-border": "rgba(173, 17, 20, 0.34)",
          "--error-text": "#AD1114",
          "--border-radius": "1rem",
          "--width": "25rem"
        }
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast min-h-16 gap-3 border-l-4 px-4 py-3 text-sm font-semibold shadow-[0_22px_48px_rgba(0,70,139,0.18)] backdrop-blur supports-[backdrop-filter]:bg-white/96",
          default: "border-l-[#00468B]",
          success: "border-l-[#2A6B2C]",
          info: "border-l-[#00468B]",
          warning: "border-l-[#a06700]",
          error: "border-l-[#AD1114]",
          icon:
            "mr-2 grid size-8 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-current/15 [&>svg]:size-4",
          content: "gap-1",
          title: "text-[0.92rem] font-black leading-snug tracking-normal",
          description: "text-[0.82rem] font-medium leading-relaxed opacity-85",
          closeButton:
            "!size-6 !border-[#d4e4ef] !bg-white !text-slate-500 !shadow-sm hover:!border-[#00468B]/30 hover:!text-[#00468B]",
          actionButton:
            "!rounded-lg !bg-[#00468B] !px-3 !font-bold !text-white hover:!bg-[#003a73]",
          cancelButton:
            "!rounded-lg !bg-[#E6F6FF] !px-3 !font-bold !text-[#00468B]",
        },
      }}
      {...props} />
  );
}

export { Toaster }
