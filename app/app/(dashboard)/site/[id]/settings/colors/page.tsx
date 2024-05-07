import ColorPicker from "@/components/color-picker";
import Form from "@/components/form";
import { updateSite } from "@/lib/actions";


export default async function SiteSettingsColor({
  params,
}: {
  params: { id: string };
}) {
  const data = await prisma.site.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
  });
  

  return (
    <div className="flex flex-col space-y-6">
      
      <ColorPicker background={data.background} site={data.id}/>
     
    </div>
  );
}
