import { Box, Button, TextField, Stack, Container } from "@mui/material";
import { useEffect, useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { styled } from "@mui/system";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../../components/Header";
import UserService from "../../../service/UserService";
import useEth from "../../../contexts/EthContext/useEth";
const NeonTextField = styled(TextField)(({ theme }) => ({
  "& label.Mui-focused": {
    color: "cyan",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "cyan",
  },
  "& .MuiFilledInput-root": {
    background: "rgba(128, 128, 128, 0.7)",
    "&:hover": {
      background: "rgba(128, 128, 128, 0.8)",
    },
    "&.Mui-focused": {
      background: "rgba(128, 128, 128, 0.9)",
    },
  },
  "& .MuiFilledInput-input": {
    color: "white",
  },
  "& .MuiFormHelperText-root": {
    color: "red",
  },
}));

const NeonButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #AD1EEB 30%, #d938a9 90%)",
  borderRadius: 3,
  border: 0,
  color: "white",
  height: 48,
  padding: "0 30px",
  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
}));

const UserDashboard = () => {
  const {
    state: { contract, accounts, myself },
  } = useEth();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const userService = new UserService(contract, accounts, myself);
  const [foundDiagnostician, setFoundDiagnostician] = useState(null);

  const handleFormSubmit = (values) => {
    console.log(values);
    userService.askForVerification(values["name"], values["siret"]);
  };

  useEffect(() => {
    const getAccountInfo = async () => {
      console.log(accounts[0]);
      const diagnostician = userService.getDiagnostician(accounts[0]);
      diagnostician.then((d) => {
        console.log(d);
        setFoundDiagnostician(d);
      });
      console.log(foundDiagnostician);
    };
    getAccountInfo();
  }, [contract, accounts]);

  return (
    <Box m="20px">
      <Container
          sx={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "100%",
          }}
        >
      <Header
        title="Demande de vérification"
        subtitle="Demander une vérification pour pouvoir réaliser des diagnostics."
      />
      {foundDiagnostician && (
        
          <div>
            {foundDiagnostician.isCertified ? (
              <p>Vous etes deja certifié</p>
            ) : (
              <div>
                {foundDiagnostician.name ? (
                  <p>En cours</p>
                ) : (
                  <div>
                    <Formik
                      onSubmit={handleFormSubmit}
                      initialValues={initialValues}
                      validationSchema={checkoutSchema}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        handleBlur,
                        handleChange,
                        handleSubmit,
                      }) => (
                        <form onSubmit={handleSubmit}>
                          <Box
                            display="grid"
                            gap="30px"
                            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                            sx={{
                              "& > div": {
                                gridColumn: isNonMobile ? undefined : "span 4",
                              },
                            }}
                          >
                            <Stack>
                              <NeonTextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="Raison Sociale"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.name}
                                name="name"
                                error={!!touched.name && !!errors.name}
                                helperText={touched.name && errors.name}
                                sx={{ gridColumn: "span 2", width: "400px" }}
                              />
                              <NeonTextField
                                fullWidth
                                variant="filled"
                                type="text"
                                label="SIRET"
                                onBlur={handleBlur}
                                onChange={handleChange}
                                value={values.siret}
                                name="siret"
                                error={!!touched.siret && !!errors.siret}
                                helperText={touched.siret && errors.siret}
                                sx={{ gridColumn: "span 2", width: "400px"  }}
                              />
                              <Box
                                display="flex"
                                justifyContent="end"
                                mt="20px"
                              >
                                <NeonButton
                                  type="submit"
                                  color="secondary"
                                  variant="contained"
                                >
                                  Demande la vérification
                                </NeonButton>
                              </Box>
                            </Stack>
                          </Box>
                        </form>
                      )}
                    </Formik>
                  </div>
                )}
              </div>
            )}
          </div>
        
      )}
      </Container>
    </Box>
    
  );
};

const siretRegExp = /^[0-9]{14}$/;

const checkoutSchema = yup.object().shape({
  name: yup.string().required("Champ obligatoire"),
  siret: yup
    .string()
    .matches(siretRegExp, "SIRET incorrect")
    .required("Champ obligatoire"),
});
const initialValues = {
  name: "",
  siret: "",
};

export default UserDashboard;
