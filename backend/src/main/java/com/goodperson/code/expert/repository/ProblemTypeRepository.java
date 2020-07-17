package com.goodperson.code.expert.repository;

import com.goodperson.code.expert.model.ProblemType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemTypeRepository extends JpaRepository<ProblemType, Long> {
}