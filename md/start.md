## What's LDP4j

LDP4j is a **Java-based framework for the development of read-write Linked Data applications** based on the W3C Linked Data Platform 1.0 (LDP) specification.

This framework provides the components required by clients and servers for handling their communication, hiding the complexity of the protocol details from application developers and letting them focus on implementing their application-specific business logic.

In addition, the framework also provides a set of middleware services for the development of read-write Linked Data applications with requirements beyond the LDP specification scope.

## High-level Design of LDP4j

In order to facilitate the development of LDP-based applications, LDP4j provides different components that developers may use for the development of such applications, in particular: an extensible LDP Server and an extensible LDP Client. The following sections will present both components.

### LDP4j Server Component

The purpose of the LDP4j Server Component (or *LDP Server* for short) is to provide the means for publishing application-specific LDP containers and resources, abstracting developers from the particularities of the LDP protocol and letting them focus on the particular business logic behind the containers and resources themselves.

The LDP Server is organized into two modules, namely: the **LDP Server API** and the **LDP Server Implementation**, both of them described below.

### LDP Server API

The *LDP Server API* is divided into: (1) the **server API**, which defines entities related to different aspects of the LDP protocol that are of interest for the LDP Server (i.e., resources, content, and format); (2) the **server SPI**, which defines APIs that provide extensions to the types supported by the *server API*; (3) the **server frontend**, which provides the developers with a frontened that allows the interaction with the different services provided by the LDP Server, if required; and (4) the **developer API**, which defines the low-level interfaces and annotations that have to be used to create server-side LDP application using LDP4j.

This latter part of the API provides and extensibility layer that enables the developer specify the behaviour of the LDP4j Server when dealing with LDP containers and resources. For the time being two extensibility points are provided: `org.ldp4j.server.core.ILinkedDataPlatformContainer` and `org.ldp4j.server.core.ILinkedDataPlatformResourceHandler`.

In order to develop *direct* LDP containers, developers must implement the `org.ldp4j.server.core.ILinkedDataPlatformContainer` interface. This interface provides the means for handling the creation of LDP resources given an RDF serialization, as well as for retrieving an RDF summary of contents of one or more of the resources managed by the container. Each container must be identified by an application unique identifier. In addition, every created resource must be identified by a container unique identifier.

On the other hand, the `org.ldp4j.server.core.ILinkedDataPlatformResourceHandler` interface has to be implemented for developing LDP resources. This interface provides the means for retrieving the contents of existing resources and well as for updating their contents given an RDF serialization. Resource handlers must be identified by an application unique identifier, which should match that of the container used for the creation of the resources handled by the handler.

If the application supports resource deletion, developers will have to extend the classes that implement the *org.ldp4j.server.core.ILinkedDataPlatformResourceHandler* in one of two ways: implement also the `org.ldp4j.server.core.Deletable` interface, or provide a method with the same signature as the *delete* method defined in the latter interface, annotated with `org.ldp4j.server.core.Delete`.

#### LDP Server Implementation

The implementation includes a [JAX-RS 1.0](http://jcp.org/aboutJava/communityprocess/final/jsr311/) based application which is published under the **/ldp** path. The application includes an *LDP container manager* and an *LDP resource handler manager*. These managers discover LDP containers and LDP resource handlers at runtime, and enable dispatching LDP-protocol requests to them using the **/ldp/containers/«containerId»** and **/ldp/resources/«containerId»/«resourceId»** paths, respectively.

The runtime discovery of LDP containers and LDP resource handlers relies on the standard *[Service Provider Mechanism](http://docs.oracle.com/javase/6/docs/api/java/util/ServiceLoader.html)* of the Java 6 SE.

For the time being the implementation supports the following [LDP 1.0 LCWD2](http://www.w3.org/TR/2014/WD-ldp-20140311/) capabilities:

* **Direct Container**
  * *Resource creation*, supporting both RDF/XML and Turtle serializations.
  * *Container retrieval*, supporting both RDF/XML and Turtle serializations.
* **RDF Source-based LDP Resources**
  * *Resource retrieval*, supporting both RDF/XML and Turtle serializations.
  * *Resource update*, supporting both RDF/XML and Turtle serializations.
  * *Resource deletion*

However the following caveats apply:

1. The container retrieval operations do not support the current paging functionality. Also, the method for selecting the contents of the container representation is still based on a [previous version of the specification](http://www.w3.org/TR/2013/WD-ldp-20130307/)

### LDP4j Client Component

While the LDP4j Server Component is meant to help developers in publishing contents via the LDP protocol, the purpose of the LDP4j Client Component is to let developers build applications capable of consuming those contents exploiting the LDP protocol. Again, the LDP4j Client Component hides the specificities of the LDP protocol to the developer so that he only has to decide how to use those contents.

The LDP4j Client Component (or *LDP Client* for short) is also divided into two modules: the **LDP Client API** and the **LDP Client Implementation**, which are presented in the following paragraphs.

#### LDP Client API

The API provides the frontend to the LDP Client that developers have to use for consuming LDP contents. The frontend consists of a façade `org.ldp4j.client.LDPClientFactory` that allows creating **proxies** to containers `org.ldp4j.client.ILDPContainer` and resources `org.ldp4j.client.ILDPResources` given their URLs. For the time being, these proxies provide the client-side functionalities that match those offered by the current version of the LDP Server, that is, resource creation on containers and content retrieval on resources.

#### LDP Client Implementation

The LDP Client Implementation is also built with extensibility on mind. Thus, the implementation provides an SPI that defines the extensibility points that developers have to provide in order to create specific LDP Client implementations. In particular, one extensibility point is defined: `org.ldp4j.client.ILDPClientProvider`. This interface defines methods for creating proxies to containers and resources following the contracts defined in the LDP Client API.

As in the case of the LDP Server Implementation, the runtime discovery of providers in the LDP Client façade relies on the standard Service Provider Mechanism of the Java 6 SE.

The default provider implementation is based on JAX-RS 1.0 using a CXF implementation.

## Using LDP4j

### Prerequisites

In order to use LDP4j you''ll need the following:

* A Java SE 1.6 distribution
* A Maven 3 distribution
* An Apache TomEE 1.5.1 distribution. In fact any JAX-RS 1.0 capable container would suffice. Servlet 3.0/JSP 2.2 containers can be also used if they are extended with a JAX-RS implementation or the JAX-RS implementation is included in the application's WAR.
* A Git client

### Build the sources

The first step is to grab the sources from the project's Git repository:

    git clone git://github.com/ldp4j/ldp4j.git

Once the repository is locally available you can build it as follows:

    mvn install

### Creating a server-side LDP application

Using Apache TomEE as target container, in order to create a server-side application you'll just need to create a java application that includes the LDP4j Server Component and package it as a WAR.

This can be done in the Maven project with the following dependency:

    <dependency>
        <groupId>org.ldp4j.framework</groupId>
        <artifactId>ldp4j-server-depchain</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <type>pom</type>
    </dependency>

A container could be implemented as follows:

    package org.examples;

    import java.util.Collection;

    import org.ldp4j.server.Format;
    import org.ldp4j.server.IContent;
    import org.ldp4j.server.LinkedDataPlatformException;
    import org.ldp4j.server.core.ILinkedDataPlatformContainer;

    public class ExampleContainer implements ILinkedDataPlatformContainer {

        @Override
        public String getContainerId() {
            return <<containerId>>;
        }

        @Override
        public String createResource(IContent content, Format format) throws LinkedDataPlatformException {
            <<creation logic here>>
        }

        @Override
        public IContent getSummary(final Collection<String> resources, final Format format) throws LinkedDataPlatformException {
            <<summarization logic hereupdate>>
        }

    }

In order to make the container implementation available to the LDP4j Server, a file named **org.ldp4j.server.core.ILinkedDataPlatformContainer** has to be added to the **META-INF/services** directory of the WAR including the full qualified names of the classes that implement this interface. In our example, the file would only include the following line:

    org.examples.ExampleContainer

Similarly, a deletable resource handler associated to the previous container could be implemented as follows:

    package org.examples;

    import java.util.Collection;

    import org.ldp4j.server.Format;
    import org.ldp4j.server.IContent;
    import org.ldp4j.server.IResource;
    import org.ldp4j.server.LinkedDataPlatformException;
    import org.ldp4j.server.LinkedDataPlatformServer;
    import org.ldp4j.server.core.Deletable;
    import org.ldp4j.server.core.DeletionException;
    import org.ldp4j.server.core.DeletionResult;
    import org.ldp4j.server.core.ILinkedDataPlatformResourceHandler;

    public class ExampleResource implements ILinkedDataPlatformResourceHandler, Deletable {

        @Override
        public String getContainerId() {
            return "myContainer";
        }

        @Override
        public IResource getResource(final String id) throws LinkedDataPlatformException {
            <<retrieval logic here>>
        }

        @Override
        public Collection<String> getResourceList() throws LinkedDataPlatformException {
            <<resource listing logic here>>
        }

        @Override
        public IResource updateResource(String resourceId, final IContent content, Format format) throws LinkedDataPlatformException  {
            <<update logic here>>
        }

        @Override
        public DeletionResult delete(String resourceId) throws DeletionException {
            <<deletion logic here>>
        }

    }

Again, in order to make the container implementation available to the LDP4j Server, a file named **org.ldp4j.server.core.ILinkedDataPlatformResourceHandler** has to be added to the **META-INF/services** directory of the WAR including the full qualified names of the classes that implement this interface. In our example, the file would only include the following line:

    org.examples.ExampleResource

### Consuming LDP contents

In order to consume LDP contents you'll need to create a Java application that uses the LDP4j Client. In Maven this can be done in the project with the following dependency:

    <dependency>
        <groupId>org.ldp4j.framework</groupId>
        <artifactId>ldp4j-client-depchain</artifactId>
        <version>1.0.0-SNAPSHOT</version>
        <type>pom</type>
    </dependency>

A proxy to a container located at *http://www.example.org/myContainer/* can be created as follows:

    package org.examples;

    import java.net.URL;

    import org.ldp4j.client.ILDPContainer;
    import org.ldp4j.client.LDPClientFactory;

    public class ExampleClient {

        public static void main(String[] args) {
            String location="http://www.examples.org/myContainer";
            try {
                ILDPContainer containerProxy = LDPClientFactory.createContainer(new URL(location));
                <<use proxy>>
            } catch(Exception e) {
                <<failure recovery>>
            }
        }

    }

Similarly, a proxy to a resource located at *http://www.example.org/myContainer/00001* can be created as follows:

    package org.examples;

    import java.net.URL;

    import org.ldp4j.client.ILDPResource;
    import org.ldp4j.client.LDPClientFactory;

    public class ExampleClient {

        public static void main(String[] args) {
            String location="http://www.examples.org/myContainer/00001";
            try {
                ILDPResource resourceProxy = LDPClientFactory.createResource(new URL(location));
                <<use proxy>>
            } catch(Exception e) {
                <<failure recovery>>
            }
        }

    }