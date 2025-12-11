package kr.ulsan.dreamshowchoir.dungeong.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        // JWT 인증 설정 (헤더에 'Authorization: Bearer 토큰' 넣기 위함)
        String jwtSchemeName = "JWT Authentication";
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);

        // SecurityScheme 등록
        Components components = new Components()
                .addSecuritySchemes(jwtSchemeName, new SecurityScheme()
                        .name(jwtSchemeName)
                        .type(SecurityScheme.Type.HTTP) // HTTP 방식
                        .scheme("bearer")
                        .bearerFormat("JWT")); // 토큰 형식을 JWT로 명시

        // API 문서 정보 설정
        Info info = new Info()
                .title("드림쇼콰이어 API 명세서")
                .description("드림쇼콰이어 공식 홈페이지 구축을 위한 REST API 문서입니다.")
                .version("v1.0");

        return new OpenAPI()
                .addSecurityItem(securityRequirement) // 인증 적용
                .components(components)
                .info(info);
    }
}