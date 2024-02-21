import React from "react";
import Modal from "./ModalBase";
import Button from "../Button";
import { useAccountConfig } from "@/lib/hooks/useAccountConfig";
import AccountConfig from "./AccountConfig";
import Logo from "@/components/Logo";
import { ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal(props: WelcomeModalProps) {
  const { data: session } = useSession();
  const { isOpen, onClose } = props;
  const { onSave, error, setApiKey, apiKey, setTelemetry, telemetry } =
    useAccountConfig({ onClose });
  const [sigInFlow, setSignInFlow] = React.useState(false);

  const IntroFlow = (
    <>
      <div className="relative flex h-full w-full flex-col items-center justify-center w-full">
      <img src="/arch-diagram-w-logo.png" alt="Architecture" className="w-64 h-auto pb-6" />
      <div className="text-center" style={{ color: '#51565F' }}>
        This tool is meant to augment human biosurveillance capabilities by giving you an AI assistant to search the internet:
      </div>

      <div className="text-center" style={{ color: '#51565F' }}>
        Created by Noblis,<br/> and based on evo.ninja and AutoGPT.
      </div>
        {/*<img src="/polywrap-award.png" alt="Award" className="w-32 h-auto pb-6 pt-6" />*/}
        {/*<div className="text-center">
          Join our <a href="https://discord.gg/r3rwh69cCa" target="_blank" className="text-cyan-500">discord</a> and <a href="https://blog.polywrap.io" target="_blank" className="text-cyan-500">substack</a> to learn and
          stay<br/>informed with our latest creations!
  </div>*/}
      </div>
      <div className="flex justify-end pt-8">
        <Button onClick={() => setSignInFlow(true)}>
          <div>Try It Out!</div>
          <ArrowRight size={16} color="white" />
        </Button>
      </div>
    </>
  )

  const SignInFlow = (
    <>
      {session?.user?.email ? (
        <div className="space-y-6">
          <div className="border-b-2 border-zinc-700 pb-8 text-center">
            You're signed in!
          </div>
        </div>
      ) : (
        <>
      <div className="border-b-2 border-zinc-500 pb-8 text-center text-zinc-500">
        This is a technical preview, feedback and questions are appreciated!
      </div>



          *<div className="space-y-6 border-b-2 border-zinc-700 pb-8">
            <p>Sign in below to save your sessions</p>
            <div className="space-y-2">
              <Button
                className="w-full"
                hierarchy="secondary"
                onClick={() => signIn("github")}
              >
                <Image
                  alt="Sign in with Github"
                  width={20}
                  height={20}
                  src="/github-logo.svg"
                />
                <div>Sign in with Github</div>
              </Button>
              <Button
                className="w-full"
                hierarchy="secondary"
                onClick={() => signIn("google")}
              >
                <Image
                  alt="Sign in with Google"
                  width={20}
                  height={20}
                  src="/google-logo.svg"
                />
                <div>Sign in with Google</div>
              </Button>
            </div>
          </div>
        </>
      )}
      <AccountConfig
        setApiKey={setApiKey}
        apiKey={apiKey}
        telemetry={telemetry}
        setTelemetry={setTelemetry}
        error={error}
      />
      {/*<div className="flex justify-end border-t-2 border-zinc-700 pt-8">*/}
        <Button onClick={onSave}>
          <div>Get Started</div>
          <ArrowRight size={16} color="white" />
        </Button>
      {/*</div>*/}
    </>
  );

  return (
    <>
      <Modal isOpen={isOpen} title="Welcome to BioSurveillance Tool" onClose={onClose}>
        {sigInFlow ? SignInFlow : IntroFlow}
      </Modal>
    </>
  );
}
