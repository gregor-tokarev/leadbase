import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    TextField,
    TextFieldDescription,
    TextFieldErrorMessage,
    TextFieldLabel,
    TextFieldRoot,
} from "@/components/ui/textfield";
import { db } from "@/libs/db";
import { lucia } from "@/libs/lucia";
import { users } from "@/schema/auth";
import { getUserByEmail, setUser } from "@/services/user.service";
import { createForm, email, getValues, required } from "@modular-forms/solid";
import { action, useAction } from "@solidjs/router";
import { nanoid } from "nanoid";
import { createSignal, Show } from "solid-js";
import { RiLoaderLine } from "solidjs-remixicon";
import { setCookie } from "vinxi/http";

const sendCodeAction = action(async (email: string) => {
    "use server";

    const code = nanoid();

    const user = await getUserByEmail(email);
    if (!user)
        await db
            .insert(users)
            .values({
                verificationCode: code,
                email,
            })
            .execute();
    else {
        await setUser(email, { verificationCode: code, verifyedAt: null });
    }

    // Send email ....

    return { message: "ok" };
});

const verifyCodeAction = action(async (email: string, code: string) => {
    "use server";

    const user = await getUserByEmail(email);
    if (!user) throw new Error("Пользователь не найден");

    if (!user.verificationCode) throw new Error("Пользователь не найден");

    if (user.verificationCode !== code) throw new Error("Неверный код");

    await setUser(email, { verificationCode: null, verifyedAt: new Date() });
    const session = await lucia.createSession(user.id, {})

    const sessionCookie = lucia.createSessionCookie(session.id)
    // const res = new Response(JSON.stringify({ message: "ok" }))

    setCookie(sessionCookie.name, sessionCookie.value)

    return { message: "ok" };
});

type EmailForm = {
    email: string;
};

type CodeForm = {
    code: string;
};

export default function Signup() {
    const [step, setStep] = createSignal<"email" | "code">("email");

    const sendCode = useAction(sendCodeAction);
    const [emailForm, Email] = createForm<EmailForm>();

    const verifyCode = useAction(verifyCodeAction);
    const [codeForm, Code] = createForm<CodeForm>();

    const [loading, setLoading] = createSignal(false);
    const onSubmit = async () => {
        try {
            const { email } = getValues(emailForm);
            setLoading(true);

            if (step() === "email") {
                const resp = await sendCode(email ?? "");

                resp.message === "ok" && setStep("code");
            } else if (step() === "code") {
                const { code } = getValues(codeForm)
                const resp = await verifyCode(email ?? "", code ?? "")

                if (resp.message === "ok") {
                    location.reload()
                }
            }
        } catch (e) {
            console.log(e)
        } finally {
            setLoading(false);
        }
    };


    return (
        <main class="flex pt-[30vh] justify-center min-h-screen">
            <div class="w-[400px]">
                <h1 class="text-2xl text-gray-800 text-bold">Выбирай свое дело</h1>
                <h2 class="text-2xl text-gray-400 text-bold">Регистрация в leadbase</h2>

                <Separator class="my-5" />

                <Email.Form onSubmit={onSubmit}>
                    <Email.Field
                        name="email"
                        validate={[
                            required("Обязательное поле"),
                            email("Не похоже на email"),
                        ]}
                    >
                        {(field, props) => (
                            <TextFieldRoot
                                disabled={loading()}
                                validationState={field.error ? "invalid" : "valid"}
                            >
                                <TextFieldLabel>E-mail</TextFieldLabel>
                                <TextField
                                    type="email"
                                    value={field.value}
                                    onChange={(e) => props.onInput(e)}
                                ></TextField>
                                <Show when={field.error}>
                                    <TextFieldErrorMessage>{field.error}</TextFieldErrorMessage>
                                </Show>

                                <TextFieldDescription class="!text-gray-400">
                                    Ввидите свой email на него вам прийдет ссылка для дальней
                                    регестрации
                                </TextFieldDescription>
                            </TextFieldRoot>
                        )}
                    </Email.Field>
                </Email.Form>

                <Show when={step() === "code"}>
                    <Code.Form class="mt-6" onSubmit={onSubmit}>
                        <Code.Field name="code" validate={[required("Обязательное поле")]}>
                            {(field, props) => (
                                <TextFieldRoot
                                    disabled={loading()}
                                    validationState={field.error ? "invalid" : "valid"}
                                >
                                    <TextFieldLabel>Код</TextFieldLabel>
                                    <TextField
                                        value={field.value}
                                        onChange={(e) => props.onInput(e)}
                                    ></TextField>
                                    <Show when={field.error}>
                                        <TextFieldErrorMessage>{field.error}</TextFieldErrorMessage>
                                    </Show>

                                    <TextFieldDescription class="!text-gray-400">
                                        Код прийдет вам на email
                                    </TextFieldDescription>
                                </TextFieldRoot>
                            )}
                        </Code.Field>
                    </Code.Form>
                </Show>

                <Button
                    class="w-full mt-10"
                    size="lg"
                    disabled={loading()}
                    onClick={onSubmit}
                >
                    <Show when={loading()}>
                        <RiLoaderLine class="animate-spin" />
                    </Show>
                    <span class="inline-block ml-2">Продолжить</span>
                </Button>
            </div>
        </main >
    );
}
