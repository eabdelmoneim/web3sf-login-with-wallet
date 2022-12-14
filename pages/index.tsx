import type { NextPage } from "next";

import useAuthenticate from "../hooks/useAuthenticate";
import {
  ConnectWallet,
  useAddress,
  useDisconnect,
  useMetamask,
} from "@thirdweb-dev/react";
import { useState } from "react";
import Hero from "../components/Hero";
import {
  Button,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  FormHelperText,
  RadioGroup,
  HStack,
  Radio,
} from "@chakra-ui/react";

const Home: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const address = useAddress();
  const disconnect = useDisconnect();
  const connectWithMetamask = useMetamask();
  const { login, submitReview, logout } = useAuthenticate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authMessage, setAuthMessage] = useState("N/A");

  const signInWithEthereum = async () => {
    setAuthMessage("N/A");
    await connectWithMetamask();
    await login();
    setIsLoggedIn(true);
  };

  const authenticatedRequest = async () => {
    const res = await submitReview();
    if (res.ok) {
      const data = await res.json();
      console.log("rating submitted: " + data);
      toast({
        title: "Rating submitted.",
        description: "",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      /*setAuthMessage(
        `Succesfully authenticated to backend with address ${address}`
      );*/
    } else {
      toast({
        title: "Problem submitting",
        description: "You are not authorized",
        status: "error",
        duration: 9000,
        isClosable: true,
      });

      setIsSubmitted(true);
      onClose();
      /* setAuthMessage(
        `Failed to authenticate, backend responded with ${res.status} (${res.statusText})`
      );*/
    }
  };

  const logoutWallet = async () => {
    await logout();
    setIsLoggedIn(false);
    setAuthMessage("N/A");
  };

  return (
    <>
      <Hero />
      <Center>
        {address ? (
          <Button
            colorScheme={"purple"}
            bg={"purple.400"}
            rounded={"full"}
            px={6}
            _hover={{
              bg: "blue.500",
            }}
            onClick={onOpen}
          >
            Rate the Workshop
          </Button>
        ) : (
          /*<Button
            colorScheme={"purple"}
            bg={"purple.400"}
            rounded={"full"}
            px={6}
            _hover={{
              bg: "blue.500",
            }}
            onClick={connectWithMetamask}
          >
            Connect Wallet
          </Button>*/
          <ConnectWallet></ConnectWallet>
        )}
      </Center>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leave a Rating</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isLoggedIn ? (
              <FormControl as="fieldset">
                <FormLabel as="legend">
                  How did you find the workshop?
                </FormLabel>
                <RadioGroup defaultValue="life">
                  <HStack spacing="12px">
                    <Radio value="life">Life changing</Radio>
                    <Radio value="helpful">Helpful for sure</Radio>
                    <Radio value="aight">Aight</Radio>
                    <Radio value="waste">Waste of time</Radio>
                    <Button
                      isLoading={isSubmitted}
                      colorScheme={"purple"}
                      bg={"purple.400"}
                      //rounded={"full"}
                      px={6}
                      _hover={{
                        bg: "blue.500",
                      }}
                      onClick={() => {
                        setIsSubmitted(true);
                        authenticatedRequest();
                        onClose();
                      }}
                    >
                      Submit
                    </Button>
                  </HStack>
                </RadioGroup>
                <FormHelperText>{address} logged in</FormHelperText>
              </FormControl>
            ) : (
              <Button
                colorScheme={"purple"}
                bg={"purple.400"}
                //rounded={"full"}
                px={2}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={signInWithEthereum}
              >
                Sign in with Ethereum
              </Button>
            )}
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Home;
