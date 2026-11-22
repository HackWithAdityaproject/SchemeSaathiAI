package in.schemesaathi.config;

import com.mongodb.MongoException;
import in.schemesaathi.model.CategoryDocument;
import in.schemesaathi.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner seedCategories(CategoryRepository categories) {
        return args -> {
            try {
                for (CategoryDocument category : categorySeed()) {
                    if (!categories.existsById(category.id())) {
                        categories.save(category);
                    }
                }
            } catch (MongoException exception) {
                logger.error(
                        "MongoDB category setup skipped: database is unreachable or TLS/network access failed.");
            }
        };
    }

    private List<CategoryDocument> categorySeed() {
        return List.of(
                new CategoryDocument("students", "Students", "School, college, and technical education support."),
                new CategoryDocument("farmers", "Farmers", "Agriculture, crop, irrigation, and equipment support."),
                new CategoryDocument("women", "Women", "Education, livelihood, and welfare support."),
                new CategoryDocument("senior-citizens", "Senior Citizens", "Pensions, healthcare, and social security."),
                new CategoryDocument("persons-with-disabilities", "Persons with Disabilities", "Education, accessibility, and livelihood support."),
                new CategoryDocument("economically-weaker-families", "Economically Weaker Families", "Financial, housing, education, and social welfare."),
                new CategoryDocument("unemployed-youth", "Unemployed Youth", "Skills, training, employment, and self-employment."),
                new CategoryDocument("entrepreneurs-and-small-businesses", "Entrepreneurs and Small Businesses", "Business finance and enterprise support."),
                new CategoryDocument("workers-and-labourers", "Workers and Labourers", "Insurance, pensions, and labour welfare."),
                new CategoryDocument("general-citizens", "General Citizens", "Central and state government services.")
        );
    }
}
