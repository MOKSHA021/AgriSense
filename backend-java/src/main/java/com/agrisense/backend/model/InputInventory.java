package com.agrisense.backend.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Input inventory document — mirrors models/InputInventory.js
 * Collection: "inputinventories"
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "inputinventories")
@CompoundIndex(def = "{'crop': 1, 'inputName': 1, 'district': 1, 'state': 1}")
public class InputInventory {

    @Id
    private String id;

    @Indexed
    @Field("crop")
    private String crop;

    @Indexed
    @Field("inputName")
    private String inputName;

    @Field("displayName")
    private String displayName;

    @Field("qtyPerAcre")
    private Double qtyPerAcre;

    @Field("unit")
    private String unit;

    @Field("sellerName")
    private String sellerName;

    @Indexed
    @Field("district")
    private String district;

    @Indexed
    @Field("state")
    private String state;

    @Field("distanceKm")
    private Double distanceKm;

    @Field("pricePerUnit")
    private Double pricePerUnit;

    @Field("stockQty")
    private Double stockQty;

    @Field("phone")
    private String phone = "";

    @Field("source")
    private String source = "seed"; // "seed" | "seller"

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
