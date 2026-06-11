package com.agrisense.backend.repository;

import com.agrisense.backend.model.InputInventory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InputInventoryRepository extends MongoRepository<InputInventory, String> {
    List<InputInventory> findByCropAndInputNameIn(String crop, List<String> inputNames);
}
