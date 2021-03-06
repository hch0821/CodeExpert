package com.goodperson.code.expert.dto;

import lombok.Data;

@Data
public class MarkResultDto {
    private int testcaseNumber;
    private Boolean isTimeOut;
    private Boolean isOutOfMemory;
    private Boolean isAnswer;
    private Double timeElapsed;
    private String input;
    private String expected;
    private String actual;
    private String errorMessage;
    private String outputMessage;
}