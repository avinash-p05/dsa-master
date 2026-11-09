package com.dsamaster;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DsaMasterApplication {

	public static void main(String[] args) {
		SpringApplication.run(DsaMasterApplication.class, args);
	}

}
