import { styled } from "@mui/system";
import { TextField, Button } from "@mui/material";

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
