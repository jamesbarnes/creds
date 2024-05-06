import ColorPicker from "@/components/color-picker";
import { updateSite } from "@/lib/actions";


export default function SiteSettingsColor() {
  // const data = await prisma.site.findUnique({
  //   where: {
  //     id: decodeURIComponent(params.id),
  //   },
  // });

  return (
    <div className="flex flex-col space-y-6">
      <ColorPicker />

    </div>
  );
}
