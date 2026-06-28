package handler

import (
	"net/http"

	"aksara/finance-service/internal/repository"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FinanceHandler struct {
	DB *gorm.DB
}

// ==========================================
// CATEGORIES
// ==========================================

func (h *FinanceHandler) GetCategories(c *gin.Context) {
	var categories []repository.FinanceCategory
	if err := h.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Success", "data": categories})
}

func (h *FinanceHandler) CreateCategory(c *gin.Context) {
	var input repository.FinanceCategory
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Success", "data": input})
}

func (h *FinanceHandler) UpdateCategory(c *gin.Context) {
	id := c.Param("id")
	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid format"})
		return
	}

	var cat repository.FinanceCategory
	if err := h.DB.First(&cat, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	if err := h.DB.Model(&cat).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	h.DB.First(&cat, "id = ?", id)
	c.JSON(http.StatusOK, gin.H{"message": "Success", "data": cat})
}

func (h *FinanceHandler) DeleteCategory(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Where("id = ?", id).Delete(&repository.FinanceCategory{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Success"})
}

// ==========================================
// TRANSACTIONS
// ==========================================

func (h *FinanceHandler) GetTransactions(c *gin.Context) {
	var txs []repository.FinanceTransaction
	// Order by date descending
	if err := h.DB.Order("created_at desc").Find(&txs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Success", "data": txs})
}

func (h *FinanceHandler) CreateTransaction(c *gin.Context) {
	var input repository.FinanceTransaction
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Success", "data": input})
}

func (h *FinanceHandler) DeleteTransaction(c *gin.Context) {
	id := c.Param("id")
	if err := h.DB.Where("id = ?", id).Delete(&repository.FinanceTransaction{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete transaction"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Success"})
}

// ==========================================
// MONTHLY BUDGETS
// ==========================================

func (h *FinanceHandler) GetBudgets(c *gin.Context) {
	var budgets []repository.FinanceMonthlyBudget
	if err := h.DB.Find(&budgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch budgets"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Success", "data": budgets})
}

func (h *FinanceHandler) UpsertBudget(c *gin.Context) {
	var input repository.FinanceMonthlyBudget
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var budget repository.FinanceMonthlyBudget
	if err := h.DB.Where("month_year = ?", input.MonthYear).First(&budget).Error; err != nil {
		// Not found, create
		if err := h.DB.Create(&input).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create budget"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Success", "data": input})
		return
	}

	// Exists, update
	if err := h.DB.Model(&budget).Update("amount", input.Amount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update budget"})
		return
	}
	
	budget.Amount = input.Amount
	c.JSON(http.StatusOK, gin.H{"message": "Success", "data": budget})
}

// ==========================================
// CATEGORY BUDGETS (PER MONTH)
// ==========================================

func (h *FinanceHandler) GetCategoryBudgets(c *gin.Context) {
	var categoryBudgets []repository.FinanceMonthlyCategoryBudget
	if err := h.DB.Find(&categoryBudgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch category budgets"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Success", "data": categoryBudgets})
}

func (h *FinanceHandler) UpsertCategoryBudget(c *gin.Context) {
	var input repository.FinanceMonthlyCategoryBudget
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var budget repository.FinanceMonthlyCategoryBudget
	if err := h.DB.Where("month_year = ? AND category_id = ?", input.MonthYear, input.CategoryID).First(&budget).Error; err != nil {
		// Not found, create
		if err := h.DB.Create(&input).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category budget"})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Success", "data": input})
		return
	}

	// Exists, update
	if err := h.DB.Model(&budget).Update("amount", input.Amount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category budget"})
		return
	}
	
	budget.Amount = input.Amount
	c.JSON(http.StatusOK, gin.H{"message": "Success", "data": budget})
}
