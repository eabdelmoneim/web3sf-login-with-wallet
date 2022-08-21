import type { NextPage } from "next";

import useAuthenticate from "../hooks/useAuthenticate";
import { useAddress, useDisconnect, useMetamask } from "@thirdweb-dev/react";
import { useState } from "react";
import Hero from "../components/Hero";
import {
  Button,
  Center,
  Text,
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
      const address = await res.json();
      toast({
        title: "Rating submitted.",
        description: "We've sent a POAP NFT to your wallet",
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
                      colorScheme={"purple"}
                      bg={"purple.400"}
                      //rounded={"full"}
                      px={6}
                      _hover={{
                        bg: "blue.500",
                      }}
                      onClick={() => {
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
                Sign-In with Wallet
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
