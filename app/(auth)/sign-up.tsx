import {View, Text, Alert, TouchableOpacity} from 'react-native'
import {Link, router} from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import {useState} from "react";
import {createUser} from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";

const SignUp = () => {
    const { fetchAuthenticatedUser } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({username: '', email: '', password: '' });

    const submit = async () => {
        const {username, email, password } = form;

        if(!username || !email || !password) return Alert.alert('Error', 'Please fill in all fields.');

        setIsSubmitting(true)

        try {
            await createUser({ email,  password, username });
            await fetchAuthenticatedUser();

            router.replace('/');
        } catch(error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="bg-white rounded-t-3xl -mt-4 px-6 py-6">
            {/* Tabs */}
            <View className="flex-row gap-2 mb-8">
                <TouchableOpacity 
                    className="flex-1 bg-gray-100 rounded-full py-3"
                    onPress={() => router.push('/sign-in')}
                >
                    <Text className="text-center base-semibold text-gray-400">Log In</Text>
                </TouchableOpacity>
                <View className="flex-1 bg-primary/10 rounded-full py-3">
                    <Text className="text-center base-bold text-primary">Sign Up</Text>
                </View>
            </View>

            {/* Form */}
            <View className="gap-5">
                <CustomInput
                    placeholder="Enter your name"
                    value={form.username}
                    onChangeText={(text) => setForm((prev) => ({ ...prev,username: text }))}
                    label="Full Name"
                />
                <CustomInput
                    placeholder="Enter your email"
                    value={form.email}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                    label="Email address"
                    keyboardType="email-address"
                />
                <CustomInput
                    placeholder="Enter your password"
                    value={form.password}
                    onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                    label="Password"
                    secureTextEntry={true}
                />
            </View>

            <View className="mt-8">
                <CustomButton
                    title="Sign Up"
                    isLoading={isSubmitting}
                    onPress={submit}
                />
            </View>

            <View className="flex justify-center mt-6 flex-row gap-2">
                <Text className="paragraph-regular text-gray-400">
                    Already have an account?
                </Text>
                <Link href="/sign-in" className="paragraph-semibold text-primary">
                    Login
                </Link>
            </View>
        </View>
    )
}

export default SignUp
