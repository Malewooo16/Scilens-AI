"use server"

import { revalidatePath } from "next/cache";
import { prisma } from "@/db/prisma";

export const deleteResearchQuery = async (id: string) => {  
    
    try{
        await prisma.researchQuery.delete({
            where: {id}
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting research query:", error);
        return { success: false, error: "Failed to delete research query." };
    }
}