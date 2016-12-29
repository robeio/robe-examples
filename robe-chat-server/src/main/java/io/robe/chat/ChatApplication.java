package io.robe.chat;

import io.dropwizard.servlets.CacheBustingFilter;
import io.dropwizard.setup.Bootstrap;
import io.dropwizard.setup.Environment;
import io.robe.admin.RobeApplication;
import io.robe.chat.cli.InitializeCommand;
import org.eclipse.jetty.servlets.CrossOriginFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.DispatcherType;
import javax.servlet.FilterRegistration;
import java.util.EnumSet;

public class ChatApplication extends RobeApplication<ChatConfiguration> {

    private static final Logger LOGGER = LoggerFactory.getLogger(ChatApplication.class);

    public static void main(String[] args) throws Exception {
        ChatApplication application = new ChatApplication();
        application.run(args);
    }

    @Override
    public void initialize(Bootstrap<ChatConfiguration> bootstrap) {
        super.initialize(bootstrap);
        bootstrap.addCommand(new InitializeCommand(this, "init", "Runs Hibernate and initialize required columns"));
    }


    @Override
    public void run(ChatConfiguration configuration, Environment environment) throws Exception {
        super.run(configuration, environment);
        // Enable CORS headers
        final FilterRegistration.Dynamic cors = environment.servlets().addFilter("CORS", CrossOriginFilter.class);

        // Configure CORS parameters
        cors.setInitParameter("allowedOrigins", "*");
        cors.setInitParameter("allowedHeaders", "X-Requested-With,Content-Type,Accept,Origin");
        cors.setInitParameter("allowedMethods", "OPTIONS,GET,PUT,POST,DELETE,HEAD,PATCH");
        cors.setInitParameter("exposedHeaders", "X-Total-Count");

        // Add URL mapping
        cors.addMappingForUrlPatterns(EnumSet.allOf(DispatcherType.class), true, "/*");

        environment.servlets().addFilter("CacheBustingFilter", new CacheBustingFilter())
                .addMappingForUrlPatterns(EnumSet.of(DispatcherType.REQUEST), true, "/*");
    }
}
