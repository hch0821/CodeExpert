package com.goodperson.code.expert.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CommentDto {
    private Long id;
    private UserRequestDto user;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private String content;
}
