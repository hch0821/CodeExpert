package com.goodperson.code.expert.dto;

import java.io.Serializable;

import lombok.Data;

@Data
public class ProblemDto implements Serializable {
    private static final long serialVersionUID = 1009L;
    private Long id;
    private String title;
    private ProblemTypeDto type;
    private ProblemLevelDto level;
    private long resolveCount;
    private boolean createdByMe;
    private boolean resolved;
}