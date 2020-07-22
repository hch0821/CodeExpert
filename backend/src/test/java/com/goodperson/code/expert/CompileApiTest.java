package com.goodperson.code.expert;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import com.goodperson.code.expert.dto.CompileResultDto;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class CompileApiTest {

    @Test
    public void CompilePythonTest() throws Exception {
        String code = "import time\ndef solution(array):\n\tfor _ in range(500000):\n\t\tpass\n\ttime.sleep(0.1)\n\treturn sum(array)\n";
        CompileResultDto compileResultDto = compilePython(code, 1000);
        System.out.println(compileResultDto);
    }

    private CompileResultDto compilePython(String code, int timeOutInMiliseconds) throws Exception {
        LocalDateTime now = LocalDateTime.now();
        final Path validaterFilePath = Paths
                .get("D:/Programming/CodeExpert/backend/src/test/java/com/goodperson/code/expert/python_compiler.py");

        final String validateCode = Files.readString(validaterFilePath);
        code = code + "\n" + validateCode;
        File compileDirectory = new File("C:/code_expert/compile/", now.format(DateTimeFormatter.BASIC_ISO_DATE));
        if (!compileDirectory.exists())
            compileDirectory.mkdirs();

        File compileFile = new File(compileDirectory,
                now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS")) + ".py");
        compileFile.createNewFile();
        try (FileWriter fileWriter = new FileWriter(compileFile, false);) {
            fileWriter.write(code);
        }

        String pythonPath = "D:/Program files/Python3.8/python.exe";
        String[] commands = new String[] { pythonPath, compileFile.getAbsolutePath(), "timeout:" + timeOutInMiliseconds,
                "integer_array:[1, 2, 3, 4]", "integer:10" };

        Runtime runtime = Runtime.getRuntime();

        Process process = runtime.exec(commands);
        process.waitFor();
        try (BufferedReader error = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                BufferedReader input = new BufferedReader(new InputStreamReader(process.getInputStream()));) {
            String line = "";
            StringBuffer errorBuffer = new StringBuffer();
            StringBuffer outputBuffer = new StringBuffer();
            boolean isTimeOut = false;
            boolean isAnswer = false;
            Double timeElapsed = null;
            String expected = null;
            String actual = null;
            String errorMessage = null;
            String outputMessage = null;
            while ((line = error.readLine()) != null) {
                if (line.startsWith("$timeout|")) {
                    isTimeOut = true;
                    timeElapsed = (double) timeOutInMiliseconds;
                    break;
                } else {
                    errorBuffer.append(line);
                    errorBuffer.append("\n");
                }
            }
            while ((line = input.readLine()) != null) {
                if (line.equals("$answer")) {
                    isAnswer = true;
                } else if (line.startsWith("$not_answer|")) {
                    String[] splitted = line.split("\\|");
                    expected = splitted[1];
                    actual = splitted[2];
                } else if (line.startsWith("$time|")) {
                    String[] splitted = line.split("\\|");
                    timeElapsed = Double.valueOf(splitted[1]);
                } else {
                    outputBuffer.append(line);
                    outputBuffer.append("\n");
                }
            }
            errorMessage = errorBuffer.toString();
            outputMessage = outputBuffer.toString();

            CompileResultDto compileResultDto = new CompileResultDto();
            compileResultDto.setActual(actual);
            compileResultDto.setErrorMessage(errorMessage);
            compileResultDto.setExpected(expected);
            compileResultDto.setIsAnswer(isAnswer);
            compileResultDto.setIsTimeOut(isTimeOut);
            compileResultDto.setOutputMessage(outputMessage);
            compileResultDto.setTimeElapsed(timeElapsed);
            return compileResultDto;
        }
    }
}