UPDATE tipo_ingresso
SET venda_inicio = CASE
        WHEN venda_inicio IS NULL OR venda_inicio < CURRENT_TIMESTAMP
        THEN DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY)
        ELSE venda_inicio
    END,
    venda_final = CASE
        WHEN venda_final IS NULL OR venda_final < CURRENT_TIMESTAMP
        THEN DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 60 DAY)
        ELSE venda_final
    END
WHERE venda_final IS NULL OR venda_final < CURRENT_TIMESTAMP;
