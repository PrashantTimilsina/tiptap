"use client";
import Tiptap from "@/components/text-editor";
import { Button } from "@/components/ui/button";

import { Controller, useForm } from "react-hook-form";
function App() {
  const { control } = useForm();
  return (
    <div className="ml-6 ">
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div className="">
            <Tiptap content={field.value} onChange={field.onChange} />
            <Button onClick={() => console.log(field)}>Submit</Button>
          </div>
        )}
      />
    </div>
  );
}

export default App;
