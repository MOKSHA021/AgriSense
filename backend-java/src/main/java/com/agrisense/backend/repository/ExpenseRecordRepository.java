package com.agrisense.backend.repository;

import com.agrisense.backend.model.ExpenseRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpenseRecordRepository extends MongoRepository<ExpenseRecord, String> {
    Optional<ExpenseRecord> findByUser(String userId);
}
