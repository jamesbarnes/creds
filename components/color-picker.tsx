'use client';
import { useState } from 'react';
import {ChromePicker} from 'react-color'
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { updateBackground } from '@/lib/actions';

import LoadingDots from "@/components/icons/loading-dots";

export default function ColorPicker({
    background,site
  }: {
    background: string, site: string
  }) {
const [selectedBackground, setSelectedBackground] = useState(background);
    
    // Rest of the code...

function FormButton() {
    const { pending } = useFormStatus();
    return (
      <button
        onClick={async () => {
            await updateBackground(selectedBackground, site);
          }}
        className={cn(
          "flex h-8 w-32 items-center justify-center space-x-2 rounded-md border text-sm transition-all focus:outline-none sm:h-10",
          pending
            ? "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            : "border-black bg-black text-white hover:bg-white hover:text-black dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800",
        )}
        disabled={pending}
      >
        {pending ? <LoadingDots color="#808080" /> : <p>Save Changes</p>}
      </button>
    );
  }
  
//   <Form
//   title="Background color"
//   description="The background color for your site."
//   helpText="Please use 32 characters maximum."
//   inputAttrs={{
//     type: "text",
//     defaultValue: data?.background!,
//     placeholder: "subdomain",
//     maxLength: 32,
//   }}
//   handleSubmit={updateSite}
// />


  return (
    <><ChromePicker
        color={selectedBackground}
        onChange={(e) => setSelectedBackground(e.hex)}
    />
    BACKGROUND: {selectedBackground};
    <FormButton />
    
    
    </>
  )
}