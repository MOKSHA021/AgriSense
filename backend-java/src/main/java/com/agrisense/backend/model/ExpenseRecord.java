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
import java.util.ArrayList;
import java.util.List;

/**
 * Expense record document — mirrors models/ExpenseRecord.js
 * One record per user (unique index on 'user' field).
 * Collection: "expenserecords"
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "expenserecords")
public class ExpenseRecord {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("user")
    private String user; // userId (ObjectId string)

    @Field("plan")
    private CropPlan plan = new CropPlan();

    @Field("expenses")
    private List<ExpenseItem> expenses = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // ── Nested: CropPlan ────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CropPlan {
        private String crop          = "Wheat";
        private String season        = "Rabi";
        private String area          = "2";
        private String expectedYield = "18";
        private String expectedPrice = "2275";
    }

    // ── Nested: ExpenseItem ─────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExpenseItem {
        private Long   id;       // timestamp-based id
        private String category;
        private Double amount;
        private String date;
        private String notes = "";
    }
}
