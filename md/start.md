The LDP4j Framework
===================

LDP4j is a Java-based framework for the development of interoperable <span>read-write</span> Linked Data applications based on the LDP specification. This framework provides the components required by clients and servers for handling their communication, hiding the complexity of the protocol details from application developers and letting them focus on implementing their application-specific business logic. To achieve this, LDP4j provides the following features:

-   **Simplified business object handling**: the framework takes care of lifting from and lowering to an intermediate representation that can be automatically unmarshalled from or marshalled to RDF, respectively.

-   **LDP support**: the framework takes care of controlling the protocol conversation, managing all the metadata associated to the protocol in a transparent manner.

-   **REST aware**: the framework enforces REST best practices and makes them transparent to the user, for instance, publication of RDF URIRefs.

-   **HTTP compliant**: the framework takes care of fulfilling the requirements prescribed by HTTP related RFCs (e.g., message Syntax and routing , conditional request processing and entity tag handling , content negotiation ).

In addition, the framework plans extensions to the LDP specification by providing additional features aimed at enhancing the interoperability between LDP-based <span>read-write</span> Linked Data applications.

In the following sections we will briefly introduce the architecture of LDP4j (Section 1), the application model proposed (Section 2), and the way in which the framework works (Section 3). Finally, Section 4 describes how the framework aligns with the LDP specification.

Section 1. High level architecture
----------------------------------

The LDP4j framework is organized into four building blocks, as shown in the figure below.

<img src="img/LDP4j_High_Level_Architecture.png" alt="LDP4j High Level Architecture" style="width:472px;height:260px"/>

The **application API** provides the means for developing <span>read-write</span> Linked Data applications according to the LDP4j application model that will be presented in the following section.

The **application engine** takes care of

* handling the LDP protocol conversation,
* carrying out any required content transformation, and
* managing the application resources and the endpoints used for publishing such resources.

The **server frontend** handles all the server-side HTTP communication, that is, accepts incoming HTTP requests to the endpoints published by the *application engine* and returns the appropriate HTTP responses to these requests according to the dictate of the application engine.

Finally, the **client frontend** handles all the client-side HTTP communication, that is, sending HTTP requests to LDP applications and processing the responses returned for these requests.

From all these building blocks, just two are meant to be directly used by <span>read-write</span> Linked Data application developers. Thus, application providers will need to use the *application API* whereas application consumers will have to use the *client frontend*. However, application providers shall also use the *client frontend* if their applications happen to also consume linked data contents from other <span>read-write</span> Linked Data applications.

Section 2. Application model
----------------------------

In LDP4j an *application* is defined in terms of **templates** and **handlers**. On the one hand, *templates* are used for defining the semantics of the types of **resources** managed by an application as well as to define the deployment policies of the **endpoints** that the framework will use for publishing these resources. On the other hand, *handlers* are used to implement the business logic required by the templates defined by an application.

<img src="img/LDP4j_Application_Model.png" alt="LDP4j Application Model" style="width:600px;height:291px"/>

Despite the resources and endpoints are managed by the framework, their contents are controlled by the application, which exchanges them with the framework via **datasets**.

In addition, the number of managed resources, their type as well as their relations can be modified using **sessions** that allow a handler to manipulate **snapshots** of these resources. The figure above shows how all these concepts are related and the next figure shows how are they implemented in the *application API*.

<img src="img/LDP4j_Application_API.png" alt="LDP4j Application API" style="width:800px;height:421px"/>

The *templating annotations* allow defining templates for RDF sources and containers (basic, direct, and indirect). The annotations enable describing templates (identifier, human-name, and description) as well as how are they composed, that is, whether a resource has other resources attached (*i.e.*, subresources) or contains other resources (*i.e.*, containers).

The *handler API* allows implementing both RDF sources and containers, where the main difference among the two is that the latter allows creating new resources. In addition, any of these handlers can be extended to support modification and/or deletion using the appropriate interfaces from the *handler extension API*

The *data manipulation API* is organized around the **dataset**, which is a collection of **individuals** that are defined as collections of multivalued **properties**. The framework distinguishes three types of individuals depending on how these individuals are related to the resources managed by the application:

* *managed individuals* if they are associated to resources of the application and are published via and endpoint (*e.g.*, an RDF resource identified with a URIRef);
* *local individuals* if they are associated to resources of the application but are not published (*e.g.*, an RDF resource identified with a blank node); and
* *external individuals* if they are not associated to resources of the application (*e.g.*, URIRefs out-of-the-scope of the application).

Finally the *application API* also includes the *session API* that provides the means for controlling the lifecycle of the resources owned by an application, and the *application configuration API* that provides the means for the configuration and bootstrap of the application.

Section 3. Execution pipeline
-----------------------------

The process used for handling the input requests is depicted in the BPMN diagram shown in Figure . The processing of a request sent by a client involves different parties: the *Server Frontend*, the *Application Engine*, and the *LDP4j application*.

<img src="img/LDP4j_Execution_Pipeline.png" alt="LDP4j Execution Pipeline" style="width:800px;height:385px"/>

Upon receiving a request, the first task of the *Server Frontend* consists in **dispatching the request**, that is, identifying whether or not the application exposes an endpoint for handling the request. If no endpoint is available (either because it has never existed or because the endpoint has been already deleted) the appropriate HTTP client error status code is returned (*i.e.*, 404 or 410).

If the *Server Frontend* finds an endpoint then it proceeds to **preprocess the request**. This task consists in:

1. verifying that the resource allows the specified operation;
2. handling content negotiation;
3. processing the entity body if present (*i.e.*, unmarshalling the RDF body and lifting it to the intermediate `DataSet` object representation described in the previous section);
4. analyzing the LDP headers included in the request; and
5. verifying any conditional request constraint specified in the request (*e.g.*, `If-Match` and `If-Modified-Since` headers).

If the operation is not supported, content negotiation fails, the body cannot be processed, or the conditional request constraints cannot be satisfied, the appropriate HTTP client error status code is returned (*i.e.*, 405, 406, 400/415, or 412).

If the *Server Frontend* completes the preprocessing succesfully, the *Application Engine* takes over the processing of the request. Firstly, it takes care of **preparing the input data**, if available. The preparation consists in:

1. checking that the LDP metadata included as part of the input data are consistent with the current status of the resource published via the endpoint to which the request was sent (*e.g.*, in the case of a container, verifying that the container type and associated configuration details have not been changed by the client), and
2. removing any LDP specific details from the lifted `DataSet` intermediate representation, so that the application only has to deal with its business data.

If the input request LDP metadata are not consistent the appropriate HTTP client error status code is returned (*i.e.*, 409).

Whenever the input data has been prepared, the *Application Engine* then **creates an application session** and then transfers the control to the *LDP4j application*, in particular to the handler in charge of **executing the business logic** of the application, which will use the application session to notify which resources have to be created, modified, or deleted during the processing of the request. Depending on the operation the handler may use an input `DataSet` representation of a resource or may have to return an `DataSet` representation of the resource.

When the handler finishes, the *Application Engine* resumes the process. The first step consists in **terminating the application session**, that is, to handle the resource and endpoint life-cycle changes specified by the *LDP4j application*. The second step consists in **enriching the response data with LDP metadata** (*e.g.*, if the representation of a container is to be retrieved, the *Application Engine* would enrich the `DataSet` returned by the *LDP4j application* with the members and the container type) taking into account the preferences specified by the client in the request (*i.e.*, via the `Prefer` header ).

After the application’s response data has been enriched, the *Server Frontend* finishes the processing by **preparing the response**, which consists in lowering the enriched `DataSet`, marshalling the contents RDF, and generating the required LDP headers. Finally, once the response has been created it is returned to the client.

Section 4. W3C LDP Test Suite Results
-------------------------------------

The LDP4j framework provides middleware for developing <span>read-write</span> Linked Data applications using the W3C LDP protocol; thus the most appropriate evaluation criterion is the compliance of applications that are built using the LDP4j framework. We have evaluated the compliance using the official LDP Test Suite developed by the LDP WG [1].

The Test Suite contains 235 tests that evaluate whether a given implementations adheres to the rules and restrictions defined in the specification. These tests are organized in two dimensions. First they are divided according to the main features of the specification which include: RDF Sources, Non-RDF Sources, Basic Containers, Direct Containers, and Indirect Containers. Then the specification requirements are divided into three compliance levels: MUST, SHOULD, and MAY.

| **Feature**            |   **MUST**   |  **SHOULD** |   **MAY**  |
|:-----------------------|:------------:|:-----------:|:----------:|
| **RDF Source**         | 24/24 (100%) |  7/7 (100%) | 1/1 (100%) |
| **Basic Container**    | 37/37 (100%) | 15/17 (88%) |  3/4 (75%) |
| **Direct Container**   | 42/42 (100%) | 17/19 (90%) |  3/4 (75%) |
| **Indirect Container** |  37/39 (95%) | 15/17 (88%) |  3/4 (75%) |

The LDP4j framework implements all the features of the specification except those for Non-RDF Resources. The test cases which are not currently passed are because of the functionalities that are not supported at the moment, *i.e.*, <span>put-to-create</span> and PATCH. The official W3C Test Suite results [2] confirm that the LDP4j framework is compliant with the W3C LDP specification and has the majority of its features currently implemented.

[1] <http://w3c.github.io/ldp-testsuite/>

[2] <http://www.w3.org/2012/ldp/hg/tests/reports/ldp.html>

What to do next?
----------------

We encourage you to have a look at the tutorial **Building interoperable read-write Linked Data applications with the W3C Linked Data Platform and the LDP4j framework** we held at *12th Extended Semantic Web Conference ESWC 2015* [3]. The tutorial was structured in two parts: a refresh of the LDP specification, and an in-depth introduction to LDP4j. This latter part includes both an insight on the design and architecture of the framework and a hands-on practical example that shows how to develop a simple contact list application with LDP4j.

[3] <http://www.ldp4j.org/tutorials/eswc2015/>

