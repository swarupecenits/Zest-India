import {Account, Avatars, Client, Databases, ID, Query, Storage} from "react-native-appwrite";
import {CreateUserPrams, GetMenuParams, SignInParams} from "@/type";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.swarup.zestIndia",
    databaseId: '693f1bb700009affc37b',
    bucketId: '693fd025002b9cfff7df',
    userCollectionId: 'user',
    categoriesCollectionId: 'categories',
    menuCollectionId: 'menu',
    customizationsCollectionId: 'customizations',
    menuCustomizationsCollectionId: 'menu_customizations',
    ordersCollectionId: 'orders'
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);
 
export const createUser = async ({ email, password, username }: CreateUserPrams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username)
        if(!newAccount) throw Error;

        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(username).toString();

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { email, username, accountId: newAccount.$id, avatar: avatarUrl }
        );
    } catch (e) {
        throw new Error(e as string);
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (e) {
        console.log(e);
        throw new Error(e as string);
    }
}


export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries: string[] = [];

        if(category) queries.push(Query.equal('categories', category));
        if(query) queries.push(Query.search('name', query));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )

        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )

        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const updateUser = async (userId: string, data: {
    username?: string;
    firstName?: string;
    lastName?: string;
    phone?: number;
    address?: string;
    avatar?: string;
    DOB?: string;
    ID?: number;
}) => {
    try {
        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            data
        );

        return updatedUser;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const signOut = async () => {
    try {
        await account.deleteSession('current');
    } catch (e) {
        throw new Error(e as string);
    }
}

// Orders
export const createOrder = async (orderData: any) => {
    try {
        const order = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            {
                ...orderData,
                items: JSON.stringify(orderData.items) // Convert array to JSON string
            }
        );

        return order;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getUserOrders = async (userId: string) => {
    try {
        const orders = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [
                Query.equal('userId', userId),
                Query.orderDesc('$createdAt'),
                Query.limit(100)
            ]
        );

        // Parse items JSON string back to array
        return orders.documents.map(order => ({
            ...order,
            items: JSON.parse(order.items as string)
        }));
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getOrderById = async (orderId: string) => {
    try {
        const order = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId
        );

        // Parse items JSON string back to array
        return {
            ...order,
            items: JSON.parse(order.items as string)
        };
    } catch (e) {
        throw new Error(e as string);
    }
}
