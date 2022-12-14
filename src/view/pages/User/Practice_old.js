import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Checkbox,
  Collapse,
  FormControlLabel,
  Button,
  RadioGroup,
  Radio,
  TextField,
} from "@mui/material";
import UserNavigation from "../../component/UserNavigation";
import UserFooter from "../../component/UserFooter";
import { useDispatch, useSelector } from "react-redux";
import {
  getQuestionMetaData,
  questionActions,
  questionSelectors,
} from "../../../application/reducers/questionSlice";
import {
  getSubTopics,
  fetchQuestions,
  setQuestionFilter,
} from "../../../application/reducers/testSlice";
import { makeStyles } from "@material-ui/core";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import api from "../../../infrastructure/utils/axios";

const useStyles = makeStyles((theme) => ({
  root: {
    border: "2px solid gray",
    display: "flex",
    margin: "3rem 0",
  },
  subjectsCont: {
    margin: "1rem 0",
    width: "30%",
    maxWidth: 300,
  },
  checkbox: {
    display: "flex",
    columnGap: "0.5rem",
    alignItems: "center",
    background: "#EFF5F8",
    color: "#525252 !important",
    "& p": {
      fontWeight: 600,
    },
  },
  topicCont: {
    background: "#EFF5F8",
    flex: 1,
    padding: "1rem",
  },
  subTopicCont: {
    marginLeft: "2rem",
  },
}));

const ShowSelectionContainer = ({ data }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [currentSubject, setCurrentSubject] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentSubTopic, setCurrentSubTopic] = useState(null);

  const handleCurrentSubject = (id) => {
    setCurrentSubject(id);
  };
  const handleCurrentTopic = (id) => {
    setCurrentTopic(id);
  };

  const handleCurrentSubTopic = (id) => {
    setCurrentSubTopic(id);
  };

  const { selectedSubjects, selectedTopics, selectedSubTopics } = useSelector(
    questionSelectors.getQuestionMetaData
  );
  const handleSubjectChange = (id, checked) => {
    checked
      ? dispatch(questionActions.setSelectedSubject(id))
      : dispatch(questionActions.removeSelectedSubject(id));
  };
  const handleTopicChange = (id, checked) => {
    checked
      ? dispatch(questionActions.setSelectedTopic(id))
      : dispatch(questionActions.removeSelectedTopic(id));
  };
  const handleSubTopicChange = (id, checked) => {
    console.log(id);
    checked
      ? dispatch(questionActions.setSelectedSubTopic(id))
      : dispatch(questionActions.removeSelectedSubTopic(id));
  };

  const topics = useMemo(() => {
    if (!selectedSubjects || !data) return null;

    const [subject] = data.filter((subject) => subject.id === currentSubject);
    if (!subject) return null;

    return subject.topics;
  }, [data, currentSubject, selectedSubjects]);

  const subTopics = useMemo(() => {
    if (!selectedSubjects || !selectedTopics || !data) return null;

    const [subject] = data.filter((subject) => subject.id === currentSubject);
    if (!subject) return null;

    const [topic] = subject.topics.filter((topic) => topic.id === currentTopic);
    if (!topic) return null;

    return topic.subTopics;
  }, [data, selectedSubjects, selectedTopics, currentSubject, currentTopic]);

  return (
    <div className={classes.root}>
      <div className={classes.subjectsCont}>
        {data.map((subject) => (
          <div
            className={classes.checkbox}
            style={{
              background: selectedSubjects.includes(subject.id)
                ? "#EFF5F8"
                : "white",
            }}
            key={subject.id}
          >
            <Checkbox
              checked={selectedSubjects.includes(subject.id) ? true : false}
              onChange={(e) => {
                handleSubjectChange(subject.id, e.target.checked);
                handleCurrentSubject(subject.id);
              }}
              name={subject.id}
            />
            <Typography>{subject.title}</Typography>
          </div>
        ))}
      </div>
      <div className={classes.topicCont}>
        {topics?.map((topic) => (
          <div key={topic.id}>
            <div className={classes.checkbox} key={topic.id}>
              <Checkbox
                checked={selectedTopics.includes(topic.id) ? true : false}
                onChange={(e) => {
                  handleTopicChange(topic.id, e.target.checked);
                  handleCurrentTopic(topic.id);
                }}
                name={topic}
              />
              <Typography>{topic.title}</Typography>
              <div style={{ flex: 1 }} />

              {currentTopic !== topic.id ? (
                <AddIcon style={{ color: "#BFBFBF" }} />
              ) : (
                <RemoveIcon style={{ color: "#F23A5E" }} />
              )}
            </div>
            <Collapse
              in={currentTopic === topic.id}
              timeout="auto"
              unmountOnExit
            >
              <div className={classes.subTopicCont}>
                {subTopics?.map((subTopic) => (
                  <div className={classes.checkbox} key={subTopic.id}>
                    <Checkbox
                      checked={
                        selectedSubTopics.includes(subTopic.id) ? true : false
                      }
                      onChange={(e) => {
                        handleSubTopicChange(subTopic.id, e.target.checked);
                        handleCurrentSubTopic(subTopic.id);
                      }}
                      name={subTopic.id}
                    />
                    <Typography>{subTopic.title}</Typography>
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        ))}
      </div>
    </div>
  );
};

const Practice = () => {
  const [testExists, setTestExists] = useState(async () => {
    const res = await api.get("question/testExists");
    const data = await res.data;
    return data.exists;
  });
  const [checked, setChecked] = useState([0]);
  const [mode, setMode] = useState("learning");
  const [total, setTotal] = useState(null);
  const [filters, setFilters] = useState({
    unused: true,
    incorrect: false,
    marked: false,
    all: !testExists ? true : false,
  });
  const { selectedSubTopics } = useSelector(
    questionSelectors.getQuestionMetaData
  );
  const dispatch = useDispatch();

  const filterChangeHandler = (e) => {
    const { id, checked } = e.target;
    if (id === "all" && checked)
      setFilters({
        unused: checked,
        incorrect: checked,
        marked: checked,
        all: checked,
      });
    else if (id === "unused")
      setFilters({
        ...filters,
        unused: checked,
        all: checked && filters.incorrect && filters.marked ? true : false,
      });
    else if (id === "incorrect")
      setFilters({
        ...filters,
        incorrect: checked,
        all: checked && filters.unused && filters.marked ? true : false,
      });
    else if (id === "marked")
      setFilters({
        ...filters,
        marked: checked,
        all: checked && filters.unused && filters.incorrect ? true : false,
      });
  };

  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const [questionSelectionData, setQuestionSelectionData] = useState(null);
  useEffect(() => {
    dispatch(getQuestionMetaData())
      .unwrap()
      .then((res) => {
        console.log(res);
        setQuestionSelectionData(res.data);
      })
      .catch((err) => console.log(err));
  }, [dispatch]);

  return (
    <>
      <UserNavigation />
      <Container
        maxWidth="xl"
        sx={{ textAlign: "center", margin: "70px auto" }}
      >
        <Typography
          variant="h2"
          sx={{ fontSize: "38px", color: "#434343", fontWeight: "bold" }}
        >
          Choose your practice
        </Typography>
        <Box
          style={{
            display: "flex",
            justifyContent: "space-around",
            background: "#F1F1F1",
            borderRadius: "58px",
            width: "30%",
            margin: "30px auto",
            padding: "10px",
          }}
        >
          <div>
            <RadioGroup
              aria-label="mode"
              value={mode}
              name="controlled-radio-buttons-group"
              row
              onChange={(e) => setMode(e.target.value)}
            >
              <FormControlLabel
                value="learning"
                control={<Radio />}
                label="Practice"
              />
              <FormControlLabel value="test" control={<Radio />} label="Test" />
            </RadioGroup>
          </div>
        </Box>
        {testExists ? (
          <Box
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              width: "50%",
              margin: "30px auto",
            }}
          >
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.unused}
                    onChange={(e) => filterChangeHandler(e)}
                    id="unused"
                  />
                }
                label="Unused"
              />
            </div>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.incorrect}
                    onChange={(e) => filterChangeHandler(e)}
                    id="incorrect"
                  />
                }
                label="Incorrect"
              />
            </div>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.marked}
                    onChange={(e) => filterChangeHandler(e)}
                    id="marked"
                  />
                }
                label="Marked"
              />
            </div>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.all}
                    id="all"
                    onChange={(e) => filterChangeHandler(e)}
                  />
                }
                label="All"
              />
            </div>
          </Box>
        ) : null}

        <hr />
        <br />
        <br />
        <Typography
          variant="h2"
          sx={{ fontSize: "38px", color: "#434343", fontWeight: "bold" }}
        >
          Select Questions From Functional Knowledge and Topic
        </Typography>
        {/* ************************************* */}
        {questionSelectionData ? (
          <ShowSelectionContainer data={questionSelectionData} />
        ) : null}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography>
            Enter number of questions
            <span style={{ color: "red" }}> *</span>
          </Typography>
          <TextField
            onChange={(e) => setTotal(e.target.value)}
            size="small"
            sx={{ paddingLeft: "1em" }}
            required
          />
        </Box>
        {total > 0 && selectedSubTopics.length > 0 ? (
          <NavLink to="/user/test">
            <Button
              onClick={() => {
                dispatch(setQuestionFilter({ filters, mode, total }));
                dispatch(fetchQuestions({ page: 1 }));
              }}
              sx={{ color: "white", "&:hover": { backgroundColor: "#f23a5e" } }}
            >
              Start
            </Button>
          </NavLink>
        ) : (
          <Button disabled>Start</Button>
        )}
      </Container>
      <UserFooter />
    </>
  );
};

export default Practice;
