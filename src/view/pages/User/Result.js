import { Box, Typography, styled, IconButton } from "@mui/material";
import { ArrowRight as ArrowIcon } from "@mui/icons-material";
import ProgressBar from "../../component/ProgressBar";
import UserNavigation from "../../component/UserNavigation";
import { useParams } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../../infrastructure/utils/axios";
import { useDispatch, useSelector } from "react-redux";
import { setQuestionDetail } from "../../../application/reducers/explanationSlice";

const styles = {
  container: {
    height: "82vh",
    width: "100vw",
    position: "fixed",
    top: "10vh",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "column",
  },
  navbarContainer: {
    backgroundColor: "primary.main",
    width: "100vw",
    height: "10vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    left: 0,
  },
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#F23A5E",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

function NavBar() {
  return (
    <Box sx={styles.navbarContainer}>
      <Box sx={styles.logoContainer}>
        {/* <img src={Logo} alt="" style={styles.logo} /> */}
      </Box>
      <Box sx={styles.navlinksContainer}></Box>
    </Box>
  );
}

function createData(name, calories, fat, carbs, protein) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

export default function Result() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [overallData, setOverallData] = useState({});
  const [resultData, setResultData] = useState({});
  const [results, setResults] = useState([]);
  const { id } = useParams();
  useEffect(() => {
    api
      .get(`testResult/${id}`)
      .then((res) => {
        console.log(res.data.data, "<<<<this is all data");
        setResultData(res.data.data);
        return res.data.data;
      })
      .then((data) => {
        setOverallData({ score: data.totalScore, mode: data.mode });
        return data.questions_details;
      })
      .then((results) => {
        // console.log(results, "<<<<results");
        setResults([...results]);
      });
  }, []);
  console.log("results :: ", results);
  return (
    <div>
      <UserNavigation />
      <div style={styles.container}>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "20vh",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <div>
            <Typography>Your Score</Typography>
            <div style={{ display: "flex", alignItems: "center" }}>
              <ProgressBar progress={overallData.score} />
              <Typography>{`${Math.ceil(overallData["score"])} %`}</Typography>
            </div>
          </div>
          <div>
            <Typography fontWeight="bold">Test Setting</Typography>
            <Typography>Mode: {overallData.mode}</Typography>
          </div>
        </div>

        <Table sx={{ maxWidth: 1200 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell sx={{ fontSize: "20px" }}>
                SL No.
              </StyledTableCell>
              <StyledTableCell sx={{ fontSize: "20px" }} align="left">
                Subject
              </StyledTableCell>
              <StyledTableCell sx={{ fontSize: "20px" }} align="left">
                Functional Knowledge
              </StyledTableCell>
              <StyledTableCell sx={{ fontSize: "20px" }} align="left">
                Topics
              </StyledTableCell>
              {overallData.mode === "TEST" ? (
                <StyledTableCell sx={{ fontSize: "20px" }} align="left">
                  Time Spent
                </StyledTableCell>
              ) : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result, idx) => (
              <StyledTableRow key={result?.name}>
                <StyledTableCell
                  sx={{ fontSize: "16px" }}
                  component="th"
                  scope="row"
                >
                  {idx + 1}
                </StyledTableCell>
                <StyledTableCell sx={{ fontSize: "16px" }} align="left">
                  {result?.question?.subject?.title}
                </StyledTableCell>
                <StyledTableCell sx={{ fontSize: "16px" }} align="left">
                  {result?.question?.topic?.title}
                </StyledTableCell>
                <StyledTableCell sx={{ fontSize: "16px" }} align="left">
                  {result?.question?.subtopic?.title}
                  {!result?.timeSpend ? (
                    <IconButton
                      onClick={() => {
                        dispatch(setQuestionDetail(result?.question));
                        history.push("/user/explanation");
                      }}
                    >
                      <ArrowIcon color="primary" />
                    </IconButton>
                  ) : null}
                </StyledTableCell>
                {result?.timeSpend ? (
                  <StyledTableCell sx={{ fontSize: "16px" }} align="center">
                    {result?.timeSpend}
                    <IconButton
                      onClick={() => {
                        dispatch(setQuestionDetail(result?.question));
                        history.push("/user/explanation");
                      }}
                    >
                      <ArrowIcon color="primary" />
                    </IconButton>
                  </StyledTableCell>
                ) : null}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}