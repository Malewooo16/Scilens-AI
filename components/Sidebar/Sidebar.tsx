
import { prisma } from "@/db/prisma";
import SidebarContent from "./SidebarContent";
import { auth } from "@/auth";


export default async function Sidebar() {
  const session = await auth();
  //console.log(session?.user)
  const chats = await prisma.researchQuery.findMany({
    where:{
       userId: session?.user?.id
    },
     orderBy: { createdAt: "desc" }
 } );

  return <SidebarContent chats={chats} />;
}


