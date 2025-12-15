import {View, Text, Alert, TouchableOpacity} from 'react-native'
import {Link, router} from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import {useState} from "react";
import {signIn} from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import * as Sentry from '@sentry/react-native'

const SignIn = () => {
    const { fetchAuthenticatedUser } = useAuthStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });

    const submit = async () => {
        const { email, password } = form;

        if(!email || !password) return Alert.alert('Error', 'Please enter valid email address & password.');

        setIsSubmitting(true)

        try {
            await signIn({ email, password });
            await fetchAuthenticatedUser();

            router.replace('/');
        } catch(error: any) {
            // Handle specific authentication errors
            let errorMessage = error.message;
            e
            if (error.message?.includes('Invalid credentials') || 
                error.message?.includes('invalid credentials') ||
                error.code === 401) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (error.message?.includes('user') && error.message?.includes('not found')) {
                errorMessage = 'User does not exist. Please sign up first.';
            }
            
            Alert.alert('Login Failed', errorMessage);
            Sentry.captureEvent(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="bg-white rounded-t-3xl -mt-4 px-6 py-6">
            {/* Tabs */}
            <View className="flex-row gap-2 mb-8">
                <View className="flex-1 bg-primary/10 rounded-full py-3">
                    <Text className="text-center base-bold text-primary">Log In</Text>
                </View>
                <TouchableOpacity 
                    className="flex-1 bg-gray-100 rounded-full py-3"
                    onPress={() => router.push('/sign-up')}
                >
                    <Text className="text-center base-semibold text-gray-400">Sign Up</Text>
                </TouchableOpacity>
            </View>

            {/* Form */}
            <View className="gap-5">
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
                    title="Login"
                    isLoading={isSubmitting}
                    onPress={submit}
                />
            </View>

            <View className="flex justify-center mt-6 flex-row gap-2">
                <Text className="paragraph-regular text-gray-400">
                    Don&apos;t have an account?
                </Text>
                <Link href="/sign-up" className="paragraph-semibold text-primary">
                    Sign Up
                </Link>
            </View>
        </View>
    )
}

export default SignIn
