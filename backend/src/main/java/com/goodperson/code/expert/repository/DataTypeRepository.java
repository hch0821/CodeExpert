package com.goodperson.code.expert.repository;

import com.goodperson.code.expert.model.DataType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataTypeRepository extends JpaRepository<DataType, Long> {

}