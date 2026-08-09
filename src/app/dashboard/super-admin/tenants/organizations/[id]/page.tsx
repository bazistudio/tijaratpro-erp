import OrganizationControlCenterClient from "./client-page";

export async function generateStaticParams() {
  return [{ id: "index" }];
}

export default function OrganizationControlCenterPage() {
  return <OrganizationControlCenterClient />;
}

