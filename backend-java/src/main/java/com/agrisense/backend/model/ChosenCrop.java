package com.agrisense.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * ChosenCrop document — mirrors models/ChosenCrop.js
 * One record per user (unique index on 'user' field).
 * Collection: "chosencrops"
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chosencrops")
public class ChosenCrop {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("user")
    private String user; // userId

    @Field("crop")
    private String crop;

    @Field("district")
    private String district; // stored lowercase

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
