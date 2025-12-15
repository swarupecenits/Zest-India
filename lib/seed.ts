import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[]; // list of customization names
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
    const list = await databases.listDocuments(
        appwriteConfig.databaseId,
        collectionId
    );

    await Promise.all(
        list.documents.map((doc) =>
            databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
        )
    );
}

async function clearStorage(): Promise<void> {
    const list = await storage.listFiles(appwriteConfig.bucketId);

    await Promise.all(
        list.files.map((file) =>
            storage.deleteFile(appwriteConfig.bucketId, file.$id)
        )
    );
}

async function uploadImageToStorage(imageUrl: string) {
    try {
        console.log('Uploading image:', imageUrl);
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        
        const blob = await response.blob();

        const fileObj = {
            name: imageUrl.split("/").pop() || `file-${Date.now()}.png`,
            type: blob.type || 'image/png',
            size: blob.size,
            uri: imageUrl,
        };

        console.log('Creating file in storage:', fileObj.name);
        const file = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            fileObj as any
        );

        const fileUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketId}/files/${file.$id}/view?project=${appwriteConfig.projectId}`;
        console.log('Image uploaded successfully:', file.$id);
        return fileUrl;
    } catch (error) {
        console.error('Error uploading image:', imageUrl, error);
        throw error; // Don't use fallback, let it fail so we can see the real issue
    }
}

async function seed(): Promise<void> {
    try {
        console.log('🌱 Starting seed process...');
        
        // 1. Clear all
        console.log('📦 Clearing collections and storage...');
        await clearAll(appwriteConfig.categoriesCollectionId);
        await clearAll(appwriteConfig.customizationsCollectionId);
        await clearAll(appwriteConfig.menuCollectionId);
        await clearAll(appwriteConfig.menuCustomizationsCollectionId);
        console.log('✅ Collections cleared');

        // 2. Create Categories
        console.log('📝 Creating categories...');
        const categoryMap: Record<string, string> = {};
        for (const cat of data.categories) {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.categoriesCollectionId,
                ID.unique(),
                cat
            );
            categoryMap[cat.name] = doc.$id;
            console.log(`  ✓ Created category: ${cat.name}`);
        }
        console.log(`✅ Created ${Object.keys(categoryMap).length} categories`);

        // 3. Create Customizations
        console.log('📝 Creating customizations...');
        const customizationMap: Record<string, string> = {};
        for (const cus of data.customizations) {
            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.customizationsCollectionId,
                ID.unique(),
                {
                    name: cus.name,
                    price: cus.price,
                    type: cus.type,
                }
            );
            customizationMap[cus.name] = doc.$id;
            console.log(`  ✓ Created customization: ${cus.name}`);
        }
        console.log(`✅ Created ${Object.keys(customizationMap).length} customizations`);

        // 4. Create Menu Items
        console.log('📝 Creating menu items...');
        const menuMap: Record<string, string> = {};
        for (const item of data.menu) {
            console.log(`  Processing: ${item.name}`);

            const doc = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menuCollectionId,
                ID.unique(),
                {
                    name: item.name,
                    description: item.description,
                    image_url: item.image_url,
                    price: item.price,
                    rating: item.rating,
                    calories: item.calories,
                    protein: item.protein,
                    categories: categoryMap[item.category_name],
                }
            );

            menuMap[item.name] = doc.$id;
            console.log(`  ✓ Created menu item: ${item.name}`);

            // 5. Create menu_customizations
            for (const cusName of item.customizations) {
                await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.menuCustomizationsCollectionId,
                    ID.unique(),
                    {
                        menu: doc.$id,
                        customizations: customizationMap[cusName],
                    }
                );
            }
            console.log(`  ✓ Added ${item.customizations.length} customizations for ${item.name}`);
        }
        console.log(`✅ Created ${Object.keys(menuMap).length} menu items`);

        console.log("✅ Seeding complete!");
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}

export default seed;


// <Button title='seed' onPress={()=>seed().catch((error)=>console.error("❌ Seed error:", error))}/>