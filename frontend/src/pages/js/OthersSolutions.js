import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-monokai";
import Comments from 'components/Comments';
import LikeBtn from 'components/LikeBtn';
import LoadingScreen from 'components/LoadingScreen';
import { paths } from 'constants/Paths';
import 'pages/css/OthersSolutions.css';
import React, { useEffect, useState } from 'react';
import AceEditor from 'react-ace';
import { Nav, Pagination, ProgressBar } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import AuthenticateManager from 'utils/AuthenticateManager';
import { getIntegerPathParameter, moveToPage } from 'utils/PageControl';
function OthersSolutions(props) {
    const problemId = getIntegerPathParameter(useParams()['problemId']);
    const [page, setPage] = useState(1);
    const { user } = props.account;
    const { solutionActions, problemActions } = props;
    const { data: solutionData, which: solutionWhich, isProgressing: isSolutionProgressing, isSuccess: isSolutionSuccess } = props.solution;
    const { data: problemData, isSuccess: isProblemSuccess, which:problemWhich, isProgressing: isProblemProgressing } = props.problem;
    const [languageId, setLanguageId] = useState(null);
    useEffect(() => {
        if (!user || !problemId || !AuthenticateManager.isUserLoggedIn()) {
            moveToPage(props.history, paths.pages.loginForm);
            return;
        }
        if(!isSolutionProgressing && !isProblemProgressing ){
            if (!problemData.problemMetaData){
                if (problemWhich === 'problemMetaData' && !isProblemSuccess) return;
                problemActions.getProblemMetaData();
            } 
            else {
                if (!languageId) setLanguageId(problemData.problemMetaData.languages[0].id);
                //- request others solutions using problemId, languageId, page
                else if (!solutionData.othersSolutions) {
                    if (problemWhich === 'othersSolutions' && !isSolutionSuccess) return;
                    solutionActions.getOthersSolutions({ problemId, page, languageId });
                }
                else {
                    const languageSelect = document.querySelector('#others-solution-language-select');
                    const languageSelectIdx = Array.from(languageSelect.children).findIndex(option => Number(option.dataset.languageid) === languageId);
                    if (languageSelectIdx !== -1) languageSelect.selectedIndex = languageSelectIdx;
                }
            }
        }
    }, [user, props.history, languageId, page, problemId, solutionData.othersSolutions, solutionActions, problemActions, problemData.problemMetaData, problemData.failCause, problemWhich, isProblemSuccess,isSolutionProgressing,isProblemProgressing, isSolutionSuccess]);

    const getLanguageOptions = () => {
        return problemData.problemMetaData.languages.reduce((accumulator, language) => {
            accumulator.push(
                <option key={language.id} data-languageid={language.id}>{language.name}</option>
            );
            return accumulator;
        }, []);
    }

    const getPaginationItems = () => {
        let paginationItems = [];
        for (let number = 1; number <= solutionData.othersSolutions.maxPageNumber; number++) {
            paginationItems.push(
                <Pagination.Item key={number} active={page === number} onClick={e => { setPage(number); updateOthersSolutions(); }}>{number}</Pagination.Item>
            );
        }
        return paginationItems;
    }

    const getSolutionsAndComments = () => {
        const solutions = solutionData.othersSolutions.solutions;
        if (solutions.length === 0) {
            return <h6 className="others-solutions-empty">아직 해당 언어로 풀이되지 않았습니다.</h6>
        }
        return solutions.reduce((accumulator, solution, idx) => {
            accumulator.push(
                <div key={idx} className="others-solution">
                    <h5 className="font-weight-bold">{decodeURI(solution.user.nickname)}</h5>
                    <AceEditor
                        className="code-viewer"
                        data-solutionidx={idx}
                        mode={solution.language.aceName}
                        theme="monokai"
                        defaultValue={solution.code}
                        name={`code-viewer${idx}`} // id
                        width="100%"
                        fontSize="1.0rem"
                        readOnly={true}
                        highlightActiveLine={false}
                        onLoad={onLoadReadonlyAceEditor}
                    />
                    <div className="others-solution-like">
                        <LikeBtn solutionId={solution.id} likes={solution.likes} which={solutionWhich} isSuccess={isSolutionSuccess} isProgressing={isSolutionProgressing} solutionActions={solutionActions} />
                    </div>
                    <h6 className="font-weight-bold mt-3">댓글</h6>
                    <div className="others-solution-comments">
                        <Comments solutionId={solution.id} user={user} comments={solution.comments} which={solutionWhich} isSuccess={isSolutionSuccess} isProgressing={isSolutionProgressing} solutionActions={solutionActions} />
                    </div>
                </div>

            )
            return accumulator;
        }, []);
    }

    const onLoadReadonlyAceEditor = (editor) => {
        const newHeight = editor.getSession().getScreenLength() *
            (editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth());
        editor.container.style.height = `${newHeight}px`;
        editor.resize();
        editor.renderer.$cursorLayer.element.style.display = "none"
    }

    const updateOthersSolutions = () => {
        solutionActions.clearOthersSolutions();
    }
    return (
        <div className="others-solutions">
            {(!solutionData.othersSolutions || !problemData.problemMetaData) ? <LoadingScreen label='다른 사람의 풀이를 불러오는 중입니다' /> :
                <>

                    <div className="others-solutions-title-bar">
                        <div className="others-solution-title">
                            <h3 className="font-weight-bold">다른 사람의 풀이</h3>
                            <Nav.Link className="to-problem-link ellipsis-text" href={`${paths.pages.algorithmTest.prefix}/${problemId}`}>
                                {solutionData.othersSolutions.problem.title}
                            </Nav.Link>
                        </div>
                        <select id="others-solution-language-select" className="custom-select" onChange={e => {
                            setLanguageId(Number(e.target.options[e.target.selectedIndex].dataset.languageid));
                            setPage(1);
                            updateOthersSolutions();
                        }}>
                            {getLanguageOptions()}
                        </select>

                    </div>

                    {isSolutionProgressing ? <ProgressBar animated now={100} /> : null}
                    {getSolutionsAndComments()}
                    {solutionData.othersSolutions.maxPageNumber > 0 &&
                        <div className="pages horizontal-scroll">
                            <Pagination className="align-center">
                                <Pagination.Prev onClick={e => {
                                    if (page > 1) {
                                        setPage(page - 1);
                                        updateOthersSolutions();
                                    }
                                }} />
                                {getPaginationItems()}
                                <Pagination.Next onClick={e => {
                                    if (page < solutionData.othersSolutions.maxPageNumber) {
                                        setPage(page + 1);
                                        updateOthersSolutions();
                                    }

                                }} />
                            </Pagination>
                        </div>
                    }


                </>
            }

        </div>


    );
}

export default OthersSolutions;