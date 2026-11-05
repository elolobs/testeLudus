export function errorHandler(error, request, response, next) {
  console.error(error);

  if (error.code === "ER_DUP_ENTRY") {
    return response.status(409).json({
      sucesso: false,
      erro: "Já existe um registro com esses dados.",
    });
  }
  if (
    error.code === "ER_NO_REFERENCED_ROW_2" ||
    error.code === "ER_ROW_IS_REFERENCED_2"
  ) {
    return response.status(409).json({
      sucesso: false,
      erro: "A operação conflita com registros relacionados.",
    });
  }
  if (
    error.code === "ER_CHECK_CONSTRAINT_VIOLATED" ||
    error.code === "ER_BAD_NULL_ERROR" ||
    error.code === "ER_DATA_TOO_LONG" ||
    error.code === "ER_TRUNCATED_WRONG_VALUE"
  ) {
    return response.status(422).json({
      sucesso: false,
      erro: "Os dados não atendem às regras do banco de dados.",
    });
  }

  return response.status(500).json({
    sucesso: false,
    erro: "Erro interno no servidor.",
  });
}
