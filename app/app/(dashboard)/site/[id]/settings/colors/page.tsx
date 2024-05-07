import ColorPicker from "@/components/color-picker";
import { updateSite } from "@/lib/actions";
import prisma from "@/lib/prisma";


export default async function SiteSettingsColor({
  params,
}: {
  params: { id: string };
}) {
  const data = (await prisma?.site.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  })) as { background?: string; id?: string } ?? {};

  return (
    <div className="flex flex-col space-y-6">
      <ColorPicker background={data.background ?? ''} site={data.id}/>
    </div>
  );
}
