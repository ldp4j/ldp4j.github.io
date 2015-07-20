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

![LDP4j High Level Architecture](img/LDP4j_High_Level_Architecture.png)

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

![LDP4j Application Model](img/LDP4j_Application_Model.png)

Despite the resources and endpoints are managed by the framework, their contents are controlled by the application, which exchanges them with the framework via **datasets**.

In addition, the number of managed resources, their type as well as their relations can be modified using **sessions** that allow a handler to manipulate **snapshots** of these resources. The figure above shows how all these concepts are related and the next figure shows how are they implemented in the *application API*.

![LDP4j Application API](img/LDP4j_Application_API.png)

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

![LDP4j Execution Pipeline](img/LDP4j_Execution_Pipeline.png)

Upon receiving a request, the first task of the *Server Frontend* consists in **dispatching the request**, that is, identifying whether or not the application exposes an endpoint for handling the request. If no endpoint is available (either because it has never existed or because the endpoint has been already deleted) the appropriate HTTP client error status code is returned (*i.e.*, 404 or 410).

If the *Server Frontend* finds an endpoint then it proceeds to **preprocess the request**. This task consists in:

**ENUM**

If the operation is not supported, content negotiation fails, the body cannot be processed, or the conditional request constraints cannot be satisfied, the appropriate HTTP client error status code is returned (*i.e.*, 405, 406, 400/415, or 412).

If the *Server Frontend* completes the preprocessing succesfully, the *Application Engine* takes over the processing of the request. Firstly, it takes care of **preparing the input data**, if available. The preparation consists in:

**ENUM**

If the input request LDP metadata are not consistent the appropriate HTTP client error status code is returned (*i.e.*, 409).

Whenever the input data has been prepared, the *Application Engine* then **creates an application session** and then transfers the control to the *LDP4j application*, in particular to the handler in charge of **executing the business logic** of the application, which will use the application session to notify which resources have to be created, modified, or deleted during the processing of the request. Depending on the operation the handler may use an input `DataSet` representation of a resource or may have to return an `DataSet` representation of the resource.

When the handler finishes, the *Application Engine* resumes the process. The first step consists in **terminating the application session**, that is, to handle the resource and endpoint life-cycle changes specified by the *LDP4j application*. The second step consists in **enriching the response data with LDP metadata** (*e.g.*, if the representation of a container is to be retrieved, the *Application Engine* would enrich the `DataSet` returned by the *LDP4j application* with the members and the container type) taking into account the preferences specified by the client in the request (*i.e.*, via the `Prefer` header ).

After the application’s response data has been enriched, the *Server Frontend* finishes the processing by **preparing the response**, which consists in lowering the enriched `DataSet`, marshalling the contents RDF, and generating the required LDP headers. Finally, once the response has been created it is returned to the client.
