import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Next.js Swagger API",
            version: "1.0.0",
        },
    },
    apis: ["*./app/api/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options)
