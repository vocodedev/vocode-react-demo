import {
  Box,
  Flex,
  FormControl,
  Spacer,
  Switch,
  useColorMode,
} from "@chakra-ui/react";

const DarkModeProvider = (props) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <header>
        <Flex p={2} w="100%" justify={"flex-end"}>
          <Spacer />
          <Box>
            <FormControl display="flex" alignItems="center">
              <Switch
                onChange={toggleColorMode}
                isChecked={colorMode === "dark"}
              />
            </FormControl>
          </Box>
        </Flex>
      </header>
      {props.children}
    </>
  );
};

export default DarkModeProvider;
