import React from "react";
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import {
  ErrorBoundary,
  SearchProvider,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting,
  Facet,
  WithSearch,
} from "@elastic/react-search-ui";
import { Layout, SingleLinksFacet } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";

const connector = new ElasticsearchAPIConnector({
  host: "http://localhost:9200",
  index: "mi_indice",
});

const config = {
  searchQuery: {
    search_fields: {
      name: {
        weight: 3,
      },
      text_content: {
        highlight: {
          pre_tag: "<em>",
          post_tag: "</em>",
        },
      },
    },
    result_fields: {
      name: {
        snippet: {
          size: 100,
          fallback: true,
        },
      },
      url: {
        raw: {},
      },
      text_content: {
        raw: {}, // Añadir para obtener el texto completo
        snippet: {
          size: 500,
          fallback: true,
        },
      },
      categoria: {
        raw: {},
      },
    },
    facets: {
      categoria: { type: "value", size: 10 },
    },
  },
  apiConnector: connector,
  alwaysSearchOnInitialLoad: true,
};

const ResultView = ({ result }) => {
  // Verifica si hay campos resaltados en la respuesta
  const highlightedText = result.text_content.snippet
    ? result.text_content.snippet
    : result.text_content.raw;

  return (
    <div
      className="sui-result"
      style={{ display: "flex", marginBottom: "20px" }}
    >
      <div style={{ flex: "0 0 400px", marginRight: "20px" }}>
        <img
          src={result.url.raw}
          alt={result.name.snippet}
          style={{ width: "100%", height: "auto", borderRadius: "8px" }}
        />
      </div>
      <div style={{ flex: "1" }}>
        <h2 dangerouslySetInnerHTML={{ __html: result.name.snippet }} />
        <p dangerouslySetInnerHTML={{ __html: highlightedText }} />
        <span style={{ fontStyle: "italic", color: "gray" }}>
          Categoría: {result.categoria.raw}
        </span>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={<SearchBox />}
                  sideContent={
                    <div>
                      <Facet
                        field="categoria"
                        label="Categoría"
                        filterType="any"
                        isFilterable={true}
                      />
                    </div>
                  }
                  bodyContent={
                    <Results
                      resultView={ResultView}
                      shouldTrackClickThrough={true}
                    />
                  }
                  bodyHeader={
                    <React.Fragment>
                      {wasSearched && <PagingInfo />}
                      {wasSearched && <ResultsPerPage />}
                    </React.Fragment>
                  }
                  bodyFooter={<Paging />}
                />
              </ErrorBoundary>
            </div>
          );
        }}
      </WithSearch>
    </SearchProvider>
  );
}
