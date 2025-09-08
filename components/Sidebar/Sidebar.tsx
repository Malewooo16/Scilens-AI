
import { prisma } from "@/db/prisma";
import SidebarContent from "./SidebarContent";


export default async function Sidebar() {
  const chats = await prisma.researchQuery.findMany({ orderBy: { createdAt: "desc" } });

  return <SidebarContent chats={chats} />;
}


