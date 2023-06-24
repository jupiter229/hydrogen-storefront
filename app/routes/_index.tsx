import { type V2_MetaFunction } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  const description =
    "Learn Hydrogen and laugh at the same time!";

  return [
    { name: "description", content: description },
    { name: "twitter:description", content: description },
    { title: "Hydrogen: So great, it's funny!" },
  ];
};

export default function Index() {
  return(
    <div>
      <h3>Hello from the home page!</h3>
    </div>
  )
}