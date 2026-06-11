package com.agrisense.backend.repository;

import com.agrisense.backend.model.ChosenCrop;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ChosenCropRepository extends MongoRepository<ChosenCrop, String> {
    Optional<ChosenCrop> findByUser(String userId);
    long countByDistrictAndCrop(String district, String crop);

    @Aggregation(pipeline = {
        "{ $match: { district: ?0 } }",
        "{ $group: { _id: '$crop', count: { $sum: 1 } } }"
    })
    List<CropCount> countByCropInDistrict(String district);

    interface CropCount {
        String get_id();
        long getCount();
    }
}
